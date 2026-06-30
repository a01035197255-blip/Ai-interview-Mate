package io.github.seong5381.interviewMate.ai.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private final ChatModel chatModel;

    // =========================
    // 🔥 Q&A 답변 생성
    // =========================
    public String getAnswer(String question) {
        String prompt = buildAnswerPrompt(question);
        return chatModel.call(prompt);
    }

    // =========================
    // 🔥 Q&A 프롬프트
    // =========================
    private String buildAnswerPrompt(String question) {
        return """
            너는 10년 이상의 경력을 가진 시니어 소프트웨어 엔지니어이자 기술 면접관이다.
            
            사용자가 질문한 내용에 대해 면접 답변처럼 정확하고 실무 중심으로 설명하라.
            
            답변 규칙:
            1. 불필요한 장황한 설명 금지
            2. 실무 기준으로 설명
            3. 가능하면 간단한 예시 포함
            4. 5~8줄 이내로 답변
            5. 마지막에 요약 한 줄 포함
            
            질문:
            %s
            
            답변:
            """
            .formatted(question);
    }
}