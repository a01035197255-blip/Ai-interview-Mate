package io.github.seong5381.interviewMate.user.controller;

import io.github.seong5381.interviewMate.global.response.ApiResponse;
import io.github.seong5381.interviewMate.global.security.UserDetail;
import io.github.seong5381.interviewMate.user.dto.request.UpdateUserInfoRequest;
import io.github.seong5381.interviewMate.user.dto.response.ProfileImgUrlResponse;
import io.github.seong5381.interviewMate.user.dto.response.UserInfoResponse;
import io.github.seong5381.interviewMate.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getUserProfile(@AuthenticationPrincipal UserDetail userDetail) {
        String email = userDetail.getUser().getEmail();
        String provider = userDetail.getUser().getProvider().name();

        if ("LOCAL".equals(provider)) {
            return ResponseEntity.ok(ApiResponse.success(userProfileService.getUserInfo(email)));
        } else {
            return ResponseEntity.ok(ApiResponse.success(userProfileService.getSocialProfile(email)));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<String>> updateUserInfo(@Valid @RequestBody UpdateUserInfoRequest request,
                                                              @AuthenticationPrincipal UserDetail userDetail) {
        userProfileService.updateUserInfo(userDetail.getUser().getEmail(), request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("업데이트 완료"));
    }

    @Operation(summary = "프로필 이미지 업로드", description = "로컬 유저의 프로필 사진 파일을 서버에 업로드합니다.")
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileImgUrlResponse>> uploadImage(@AuthenticationPrincipal UserDetail userDetail,
                                                                          @RequestPart(value = "image")MultipartFile file) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("프로필 사진이 변경되었습니다", userProfileService.uploadProfileImage(userDetail.getUser().getEmail(), file)));
    }
}
