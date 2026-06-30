import { apiClient } from '@/services/apiClient';

// 백엔드 공통 응답 포맷
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

// ==========================================
// 1. Request / Response DTO 인터페이스 정의
// ==========================================

export interface SettingCreateRequest {
    jobType: string;
    experienceLevel: string;
    companyType: string;
}

export interface SettingResponse {
    id: number;
    userId: number;
    jobType: string;
    experienceLevel: string;
    companyType: string;
}

export interface SessionCreateRequest {
    settingId: number;
}

export interface SessionResponse {
    id: number;
    settingId: number;
    userId: number;
    status: 'READY' | 'PROCESSING' | 'DONE' | 'TERMINATED';
    totalQuestions: number;
}

export interface terminatedRequest {
    sessionId: number;
}

export interface QuestionResponse {
    id: number;
    sessionId: number;
    stepOrder: number;
    aiQuestion: string;
    createdAt: string;
}

export interface ProgressResponse {
    currentStep: number;
    totalStep: number;
    percentage: number;
}

export interface AnswerRequest {
    sessionId: number;
    questionId: number;
    content: string;
    responseTime?: number;
}

export interface AnswerResponse {
    id: number;
    questionId: number;
    content: string;
    createdAt: string;
}

export interface FeedbackResponse {
    id: number;
    sessionId: number;
    questionId: number;
    aiFeedback: string;
    score: number;
}

// 💡 [추가 및 연동] 원본 파기 대응 및 결과창 매핑을 위한 다차원 점수 필드 및 title 추가
export interface ResultResponse {
    title: string; // 🚀 추가
    score: number;
    grade: string;
    totalTime: string;
    passedCount: number;
    strengths: string[];
    improvements: string[];
    technicalAccuracy: number; // 🚀 차트 연동용 추가
    logic: number;             // 🚀 차트 연동용 추가
    structure: number;         // 🚀 차트 연동용 추가
    communication: number;     // 🚀 차트 연동용 추가
    problemSolving: number;    // 🚀 차트 연동용 추가
}

// 💡 [추가] 백엔드에서 원본 데이터 삭제 후 보존하기 위해 들고 오는 백업 스냅샷 객체 규격
export interface QnaSnapshotResponse {
    stepOrder: number;
    questionText: string;
    answerText: string;
    aiRecommendation?: string;
    aiModelAnswer?: string;// 🚀 여기에 이 필드를 추가해 주세요!
}

// 💡 [수정] 백엔드 ReportResponse 스펙과 싱크 결합 (다차원 지표 및 스냅샷 포함)
export interface ReportResponse {
    sessionId: number;
    title: string;
    summary: string;
    passRate: number;
    tier: string;
    tierDescription: string;
    strengths: string[];
    improvements: string[];
    qnaSnapshots: QnaSnapshotResponse[]; // 🚀 원본 파기 대응용 리스트 추가 완비
    technicalAccuracy: number;
    logic: number;
    structure: number;
    communication: number;
    problemSolving: number;
    totalScore: number;
}

// ==========================================
// 2. API 오브젝트 구현
// ==========================================

export const InterviewApi = {

    /**
     * [Setting] 면접 환경 설정 생성
     */
    createSetting: async (params: SettingCreateRequest): Promise<SettingResponse> => {
        const response = await apiClient.post<ApiResponse<SettingResponse>>('/api/settings', params);
        return response.data.data;
    },

    /**
     * [Session] 면접 세션 생성
     */
    createSession: async (request: SessionCreateRequest): Promise<SessionResponse> => {
        const response = await apiClient.post<ApiResponse<SessionResponse>>('/api/sessions', request);
        return response.data.data;
    },

    /**
     * [Question] AI 면접 질문 10문항 생성
     */
    generateQuestions: async (sessionId: number): Promise<QuestionResponse[]> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse[]>>('/api/questions/generate', { sessionId });
        return response.data.data;
    },

    /**
     * [Flow] 1. 면접 시작 (첫 질문 가져오기)
     */
    startInterview: async (sessionId: number): Promise<QuestionResponse[]> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse[]>>('/api/flow/start', { sessionId });
        return response.data.data;
    },

    /**
     * [Flow] 2. 답변 제출 + 다음 질문 가져오기
     */
    submitAnswerAndNext: async (params: AnswerRequest): Promise<QuestionResponse> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse>>('/api/flow/answer', params);
        return response.data.data;
    },

    /**
     * [Flow] 3. 다음 질문 이동
     */
    nextQuestion: async (sessionId: number, stepOrder: number): Promise<QuestionResponse> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse>>('/api/flow/next', { sessionId, stepOrder });
        return response.data.data;
    },

    /**
     * [Flow] 4. 이전 질문 이동
     */
    prevQuestion: async (sessionId: number, stepOrder: number): Promise<QuestionResponse> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse>>('/api/flow/prev', { sessionId, stepOrder });
        return response.data.data;
    },

    /**
     * [Flow] 5. 질문 패스(건너뛰기)
     */
    passQuestion: async (sessionId: number, stepOrder: number): Promise<QuestionResponse> => {
        const response = await apiClient.post<ApiResponse<QuestionResponse>>('/api/flow/pass', { sessionId, stepOrder });
        return response.data.data;
    },

    /**
     * 세션 전체 질문 목록 조회 (GET /api/questions/session/{sessionId})
     */
    getQuestionsBySession: async (sessionId: number): Promise<QuestionResponse[]> => {
        const response = await apiClient.get<ApiResponse<QuestionResponse[]>>(`/api/questions/session/${sessionId}`);
        return response.data.data;
    },

    /**
     * [Flow] 6. 현재 면접 진행률 조회
     */
    getInterviewProgress: async (sessionId: number): Promise<ProgressResponse> => {
        const response = await apiClient.post<ApiResponse<ProgressResponse>>('/api/flow/progress', { sessionId });
        return response.data.data;
    },

    /**
     * 면접 강제 중단 및 세션 파기
     */
    terminateInterview: async (sessionId: number): Promise<void> => {
        const response = await apiClient.post<void>('/api/flow/terminate', { sessionId });
        return response.data;
    },

    /**
     * [Flow] 7. 면접 정상 종료 처리
     */
    finishInterview: async (sessionId: number): Promise<void> => {
        await apiClient.post(`/api/flow/finish`, {
            sessionId,
            questionId: null,
            stepOrder: null,
            content: null
        });
    },

    /**
     * [Feedback] 8. 면접 완료 후 AI 평가 전체 생성 프로세스 시작
     */
    generateAiFeedback: async (sessionId: number): Promise<FeedbackResponse> => {
        const response = await apiClient.post<ApiResponse<FeedbackResponse>>(`/api/feedback/generate/${sessionId}`);
        return response.data.data;
    },

    /**
     * [Feedback] 9. 면접 최종 결과 요약 조회
     */
    getInterviewResult: async (sessionId: number): Promise<ResultResponse> => {
        const response = await apiClient.post<ApiResponse<ResultResponse>>(`/api/feedback/result/${sessionId}`);
        return response.data.data;
    },

    /**
     * [Feedback] 10. 면접 상세 레포트 조회
     */
    getDetailedReport: async (sessionId: number): Promise<ReportResponse> => {
        const response = await apiClient.post<ApiResponse<ReportResponse>>(`/api/feedback/report/${sessionId}`);
        return response.data.data;
    },

    /**
     * 🚀 [추가] 11. 결과창에서 면접 이름을 정하고 저장할 때 호출되는 API
     * 백엔드 엔드포인트: PATCH /api/feedback/title/{sessionId}
     */
    updateReportTitle: async (sessionId: number, title: string): Promise<void> => {
        await apiClient.patch(`/api/feedback/title/${sessionId}`, { title });
    }
};