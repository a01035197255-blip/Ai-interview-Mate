package io.github.seong5381.interviewMate.question.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // getter/setter, toString, equals, hashCode 자동 생성
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequestDto {
    @NotNull
    private String question;
}