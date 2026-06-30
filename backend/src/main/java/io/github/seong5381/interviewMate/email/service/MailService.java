package io.github.seong5381.interviewMate.email.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender; // 🚀 스프링 표준 메일 발송기 주입
    private final TemplateEngine templateEngine;

    @Value("${frontend_base_url}")
    private String frontBaseUrl;

    // 🚨 중요: 도메인을 따로 사서 연동하기 전까지, 발신자는 무조건 아래 주소 고정입니다!
    private static final String FROM_EMAIL = "interview_mate@naver.com";

    public void sendVerificationCodeMail(String toEmail, String verificationCode) {
        String subject = "[InterviewMate] 회원가입 인증번호를 확인해 주세요.";
        Context context = new Context();
        context.setVariable("verificationCode", verificationCode);
        String htmlContent = templateEngine.process("mail/email-auth", context);

        sendEmail(toEmail, subject, htmlContent);
    }

    // MailService.java 내부 수정
    public void sendPasswordResetLinkMail(String toEmail, String token) {
        String subject = "[InterviewMate] 비밀번호 재설정 안내 메일입니다.";
        String resetLink = frontBaseUrl + "/reset-password/" + token;

        Context context = new Context();
        context.setVariable("resetLink", resetLink);
        String htmlContent = templateEngine.process("mail/password-reset", context);

        sendEmail(toEmail, subject, htmlContent);
    }

    /**
     * Resend SMTP 서버를 통해 메일을 비동기로 발송합니다.
     */
    @Async
    protected void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // true 설정을 주어야 HTML 및 UTF-8 인코딩이 정상 적용됩니다.
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(FROM_EMAIL);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true가 HTML 포맷 전송을 의미

            mailSender.send(message);
            log.info("🚀 [Resend API] 메일 발송 성공 -> 수신자: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ [Resend API] 메일 발송 실패. 수신자: {}, 원인: ", toEmail, e);
            throw new RuntimeException("이메일 발송 실패", e);
        }
    }
}