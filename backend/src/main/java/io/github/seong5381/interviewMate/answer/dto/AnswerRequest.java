package io.github.seong5381.interviewMate.answer.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnswerRequest {

    private Long questionId;
    private String content;
    private Long sessionId;

}