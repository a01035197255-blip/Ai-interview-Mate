# 🚀 InterviewMate

### AI 기반 모의면접 및 지원서 평가 플랫폼  
AI 면접 · 지원서 관리 · 개인화 피드백 제공 서비스

---

## 🌐 Deployment
https://interviewmate.n-e.kr/

---

## 📌 Project Overview

InterviewMate는  
지원서 관리 기능과 직무 기반 AI 모의면접 기능을 제공하는 취업 준비 지원 서비스입니다.

사용자는 지원서 작성부터 모의면접, AI 피드백까지 하나의 흐름으로 경험할 수 있습니다.

---

## 🔥 System Flow

### 📝 지원서 관리 (CRUD)
Create → Read → Update → Delete  
지원서 데이터 생성 및 개인별 관리

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

---

### 🌐 Social Login
- Google OAuth
- Naver OAuth
- 자동 회원가입 및 로그인 처리

---

### 📝 Application Management
- 지원서 CRUD 기능
- 사용자별 지원서 데이터 관리

---

### 🤖 AI Mock Interview
- 직무 기반 질문 생성
- AI 기반 면접 시뮬레이션
- 답변 저장 및 관리

---

### 📊 AI Feedback System
- 답변 분석 (논리성 · 키워드 · 직무 적합도)
- 개선 포인트 제공
- 종합 평가 리포트 생성

---

### 📂 Interview History
- 과거 면접 기록 조회
- 답변 및 결과 재확인

---

## 🚀 Tech Stack

### Backend
Java · Spring Boot · Spring Security · Spring Data JPA · JWT · PostgreSQL · Redis (optional)

### Frontend
Next.js · TypeScript · Tailwind CSS · Axios

### AI
OpenAI API · Prompt Engineering

### Infra
Docker · AWS (EC2, S3) · GitHub Actions (CI/CD) · Nginx

---

## 👨‍💻 Role & Contribution

- 지원서 CRUD API 설계 및 구현
- AI 모의면접 API 개발
- 직무 기반 질문 생성 로직 구현
- DB 설계 및 API 구조 설계
- 비즈니스 로직 개발

---

## 📈 Key Outcomes

- 지원서 관리 시스템 구축
- AI 기반 모의면접 시스템 구현
- 답변 분석 및 피드백 기능 개발
- REST API 설계 경험
- 협업 기반 프로젝트 개발 경험

---

## 🚀 Deployment Note

AWS 비용 및 운영 이슈로 인해 상시 운영 대신  
테스트 환경 중심으로 기능 검증 및 개발을 진행하였습니다.

---

## ⭐ Summary

AI를 활용하여 지원서 관리부터 모의면접, 답변 평가까지  
취업 준비 과정을 통합한 AI 기반 인터뷰 서비스입니다.
