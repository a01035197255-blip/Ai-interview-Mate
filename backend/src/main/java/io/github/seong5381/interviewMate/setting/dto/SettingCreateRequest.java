package io.github.seong5381.interviewMate.setting.dto;

import io.github.seong5381.interviewMate.setting.entity.CompanyType;
import io.github.seong5381.interviewMate.setting.entity.ExperienceLevel;
import io.github.seong5381.interviewMate.setting.entity.JobType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SettingCreateRequest {

    private JobType jobType;

    private ExperienceLevel experienceLevel;

    private CompanyType companyType;
}