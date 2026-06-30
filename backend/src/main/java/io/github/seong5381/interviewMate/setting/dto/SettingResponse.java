package io.github.seong5381.interviewMate.setting.dto;

import io.github.seong5381.interviewMate.setting.entity.CompanyType;
import io.github.seong5381.interviewMate.setting.entity.ExperienceLevel;
import io.github.seong5381.interviewMate.setting.entity.JobType;
import io.github.seong5381.interviewMate.setting.entity.Setting;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SettingResponse {

    private Long id;
    private Long userId;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private CompanyType companyType;

    public static SettingResponse from(Setting setting) {

        return SettingResponse.builder()
                .id(setting.getId())
                .userId(setting.getUser().getId())
                .jobType(setting.getJobType())
                .experienceLevel(setting.getExperienceLevel())
                .companyType(setting.getCompanyType())
                .build();
    }
}