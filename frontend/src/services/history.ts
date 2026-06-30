import { apiClient } from './apiClient';

// 백엔드의 공통 ApiResponse 포맷 정의
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

// 💡 백엔드 HistoryResponse DTO 규격과 정확히 일치시킵니다.
export interface HistoryResponse {
    id: number;           // 백엔드 세션 ID (Long)
    title: string;        // 유저가 직접 저장한 면접 제목
    score: number;        // 종합 평가 점수 (totalScore)
    duration: string;     // 포맷팅 완료된 소요 시간 (예: "15:20")
    createdAt: string;    // 생성 시간 LocalDateTime 문자열
}

// 💡 프론트엔드 UI 컴포넌트(HistoryPage)가 사용하는 데이터 규격
export interface HistoryDto {
    id: number;
    title: string;
    date: string;
    duration: string;
    score: number;
    emo: string;
}

export const HistoryApi = {
    /**
     * 🚀 로그인한 유저의 과거 면접 기록 전체 조회
     * 백엔드 엔드포인트: GET /api/feedback/history
     */
    getHistoryList: async (): Promise<HistoryResponse[]> => {
        // 백엔드 공통 응답 규격인 ApiResponse로 감싸서 데이터를 언래핑(unwrap)합니다.
        const response = await apiClient.get<ApiResponse<HistoryResponse[]>>('/api/feedback/history');
        return response.data.data;
    },

    /**
     * 🚀 [추가] 면접 연습 기록 완전 삭제
     * 백엔드 엔드포인트: DELETE /api/feedback/{sessionId}
     */
    deleteInterviewReport: async (sessionId: number): Promise<void> => {
        await apiClient.delete(`/api/feedback/${sessionId}`);
    }
};