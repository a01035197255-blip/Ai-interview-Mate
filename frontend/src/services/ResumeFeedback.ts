import { apiClient } from './apiClient';

/**
 * 공통 API 응답 구조
 */
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

/**
 * Resume Feedback 생성 요청
 */
export interface ResumeFeedbackCreateRequest {
    resumeId: number;
}

/**
 * Resume Feedback 응답
 */
export interface ResumeFeedbackResponse {
    id: number;
    resumeId: number;

    selfIntroStrength: string;
    selfIntroWeakness: string;

    projectStrength: string;
    projectWeakness: string;

    totalScore: number;
    overallFeedback: string;

    interviewQuestions: string[];
}

export const ResumeFeedbackApi = {

    /**
     * [AI] 피드백 생성
     */
    create: async (resumeId: number): Promise<ResumeFeedbackResponse> => {
        const response = await apiClient.post<ApiResponse<ResumeFeedbackResponse>>(
            `/api/resume/feedbacks`,
            { resumeId }
        );

        return response.data.data;
    },

    /**
     * [AI] 피드백 단건 조회
     */
    getFeedback: async (resumeId: number): Promise<ResumeFeedbackResponse> => {
        const response = await apiClient.get<ApiResponse<ResumeFeedbackResponse>>(
            `/api/resume/feedbacks/${resumeId}`
        );

        return response.data.data;
    },

    /**
     * 🗑 피드백 삭제 (핵심 추가)
     */
    delete: async (resumeId: number): Promise<void> => {
        await apiClient.delete(
            `/api/resume/feedbacks/${resumeId}`
        );
    }
};