package io.github.seong5381.interviewMate.resume.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "이력서 피드백 생성 요청 DTO")
public class ResumeFeedbackCreateRequest {

    @NotNull(message = "resumeId는 필수입니다.")
    @Schema(description = "이력서 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long resumeId;
}