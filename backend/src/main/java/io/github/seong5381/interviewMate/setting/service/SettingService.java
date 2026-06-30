package io.github.seong5381.interviewMate.setting.service;


import io.github.seong5381.interviewMate.auth.domain.User;
import io.github.seong5381.interviewMate.auth.repository.UserRepository;
import io.github.seong5381.interviewMate.global.exception.AuthException;
import io.github.seong5381.interviewMate.global.exception.ErrorCode;
import io.github.seong5381.interviewMate.setting.dto.SettingCreateRequest;
import io.github.seong5381.interviewMate.setting.dto.SettingResponse;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import io.github.seong5381.interviewMate.setting.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SettingService {

    private final SettingRepository settingRepository;
    private final UserRepository userRepository;

    // 생성
    public SettingResponse create(SettingCreateRequest request, String email) {


        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        Setting setting = Setting.builder()
                .user(user)
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .companyType(request.getCompanyType())
                .build();

        Setting saved = settingRepository.save(setting);

        return SettingResponse.from(saved);
    }

    // 조회
    @Transactional(readOnly = true)
    public List<SettingResponse> getMySettings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.USER_NOT_FOUND, ErrorCode.USER_NOT_FOUND.getStatus()));

        return settingRepository.findByUserId(user.getId())
                .stream()
                .map(SettingResponse::from)
                .toList();
    }
}