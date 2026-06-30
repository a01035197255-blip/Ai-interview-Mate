package io.github.seong5381.interviewMate.session.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SessionCreateRequest {

    @NotNull
    private Long settingId;
}