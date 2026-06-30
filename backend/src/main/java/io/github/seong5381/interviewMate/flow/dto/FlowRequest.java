package io.github.seong5381.interviewMate.flow.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FlowRequest {

    private Long sessionId;

    private Long questionId;

    private Integer stepOrder;

    private String content;
}