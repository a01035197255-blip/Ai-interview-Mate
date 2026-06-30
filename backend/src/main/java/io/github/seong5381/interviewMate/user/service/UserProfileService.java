package io.github.seong5381.interviewMate.user.service;

import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.global.exception.ProfileException;
import io.github.seong5381.interviewMate.user.dto.request.UpdateUserInfoRequest;
import io.github.seong5381.interviewMate.user.dto.response.ProfileImgUrlResponse;
import io.github.seong5381.interviewMate.user.dto.response.SocialUserInfoResponse;
import io.github.seong5381.interviewMate.user.dto.response.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.InputStream;
import java.net.URL;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {
    private final UserRepository userRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static:ap-northeast-2}")
    private String region;

    @Transactional(readOnly = true)
    public UserInfoResponse getUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        byte[] imageBytes = null;
        String profileLink = user.getProfileImgLink();

        // S3가 비공개여도 백엔드 내부 망을 통해서 안전하게 바이너리를 긁어옵니다.
        if (profileLink != null && profileLink.contains("profile/")) {
            S3Client s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .build();
            try {
                String s3Key = profileLink.substring(profileLink.lastIndexOf("profile/"));

                GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Key)
                        .build();

                ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
                imageBytes = objectBytes.asByteArray();
            } catch (Exception e) {
                log.error("⚠️ 비공개 S3 이미지 다운로드 실패 (빈 값 처리): {}", e.getMessage());
            } finally {
                s3Client.close();
            }
        }

        return UserInfoResponse.builder()
                .userName(user.getName())
                .email(user.getEmail())
                .profileImgUrl(imageBytes) // 프론트엔드는 이 byte[]를 받아 Base64로 그립니다.
                .provider(user.getProvider().name())
                .build();
    }

    @Transactional(readOnly = true)
    public SocialUserInfoResponse getSocialProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        // S3 아예 안 찌르고 디비에 박힌 소셜 이미지 주소 문자열 그대로 전달
        return SocialUserInfoResponse.builder()
                .userName(user.getName())
                .email(user.getEmail())
                .profileImgUrl(user.getProfileImgLink()) // String 주소 주입
                .provider(user.getProvider().name())
                .build();
    }

    @Transactional
    public void updateUserInfo(String email, UpdateUserInfoRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        user.updateName(request.getUserName());
    }

    @Transactional
    public ProfileImgUrlResponse uploadProfileImage(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .build();

        String oldProfileLink = user.getProfileImgLink();

        if (oldProfileLink != null && oldProfileLink.contains(bucket)) {
            try {
                String oldS3Key = oldProfileLink.substring(oldProfileLink.lastIndexOf("profile/"));
                DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(oldS3Key)
                        .build();
                s3Client.deleteObject(deleteObjectRequest);
                log.info("🗑️ 기존 S3 프로필 이미지 물리 삭제 성공: {}", oldS3Key);
            } catch (Exception e) {
                log.error("⚠️ 기존 S3 파일 삭제 중 오류 발생 (무시하고 진행): {}", e.getMessage());
            }
        }

        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase()
                : ".jpg";

        String s3FileName = "profile/" + UUID.randomUUID().toString() + extension;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3FileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        } catch (Exception e) {
            log.error("❌ S3 프로필 이미지 물리 저장 실패: {}", e.getMessage());
            throw new ProfileException(ErrorCode.PROFILE_IMG_UPLOAD_FAIL, ErrorCode.PROFILE_IMG_UPLOAD_FAIL.getStatus());
        } finally {
            s3Client.close();
        }

        String imgUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, s3FileName);
        user.updateProfileImg(imgUrl);

        return new ProfileImgUrlResponse(imgUrl);
    }
}