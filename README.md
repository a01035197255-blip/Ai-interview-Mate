# 🚀 InterviewMate

### AI 기반 모의면접 및 지원서 평가 플랫폼
AI 면접 · 지원서 관리 · 개인화 피드백 제공 서비스

---

## 🌐 Deployment

https://interviewmate.n-e.kr/

---

## 📄 Project Documents

- 📑 **Project Presentation (PPT)**  
  👉 [다운로드하기](./docs/InterviewMate_Project.pptx)

---

## 📌 Project Overview

InterviewMate는 지원서 관리 기능과 직무 기반 AI 모의면접 기능을 제공하는 취업 준비 지원 서비스입니다.

사용자는 지원서 작성부터 모의면접, AI 피드백까지 하나의 흐름으로 경험할 수 있습니다.

---

## 🔥 System Flow

### 📝 지원서 관리 (CRUD)

Create → Read → Update → Delete

↓

### 🎤 AI 모의면접 (직무 기반)

직무 설정

↓

AI 질문 생성 (10개)

↓

모의면접 진행

↓

답변 저장

↓

AI 답변 평가 (논리성 · 키워드 · 직무 적합도)

↓

질문별 피드백 생성

↓

종합 면접 리포트 제공

↓

### 📊 결과 분석

- 면접 결과 리포트 제공
- 답변 기반 개선 포인트 제공
- 전체 면접 성과 분석

---

## ✨ Features

### 🔐 Authentication & User Management

- 이메일 인증 (6-digit verification)
- 회원가입 / 로그인
- JWT 기반 인증/인가
- Spring Security 적용

### 🌐 Social Login

- Google OAuth
- Naver OAuth
- 자동 회원가입 및 로그인 처리

### 📝 Application Management

- 지원서 CRUD 기능
- 사용자별 지원서 데이터 관리

### 🤖 AI Mock Interview

- 직무 기반 질문 생성
- AI 기반 모의면접
- 답변 저장 및 관리

### 📊 AI Feedback System

- 답변 분석
- 키워드 분석
- 직무 적합도 평가
- 종합 피드백 제공

### 📂 Interview History

- 면접 기록 조회
- 결과 재확인

---

## 🚀 Tech Stack

### Backend

Java · Spring Boot · Spring Security · Spring Data JPA · JWT · PostgreSQL

### Frontend

Next.js · TypeScript · Tailwind CSS · Axios

### AI

OpenAI API · Prompt Engineering

### Infra

AWS EC2 · AWS RDS · Elastic Beanstalk · AWS Amplify · GitHub Actions(CI/CD) · Nginx

---

## 👨‍💻 Role & Contribution

- 로그인 및 JWT 인증 구현
- 이메일 인증(6자리 코드) 구현
- Google / Naver OAuth 로그인 구현
- AI 모의면접 기능 구현
- OpenAI 기반 피드백 기능 개발
- 지원서 CRUD 및 AI 평가 기능 개발
- REST API 설계 및 프론트엔드 연동
- 통계 대시보드 기획 및 구현

---

## 📈 Key Outcomes

- AI 기반 모의면접 플랫폼 구축
- 지원서 관리 시스템 구축
- OpenAI 기반 피드백 서비스 구현
- REST API 설계 및 협업 경험
- AWS 기반 서비스 배포 및 CI/CD 구축

---

## 🚀 Deployment Note

AWS EC2, RDS, Elastic Beanstalk, AWS Amplify를 활용하여 서비스를 배포하였으며,
GitHub Actions를 통한 CI/CD 자동화 환경을 구축하였습니다.

---

## ⭐ Summary

AI를 활용하여 지원서 관리부터 모의면접, 답변 평가까지
취업 준비 전 과정을 지원하는 AI Interview Platform입니다.
