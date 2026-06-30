import { apiClient } from './apiClient';

export interface DashboardDto {
  username: string;
  interviewCount: number;
  avgScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export const DashboardApi = {
  // 메인 대시보드 통계 및 최근 기록 요약 조회
  getDashboardSummary: async (): Promise<DashboardDto> => {
    // 🚀 [수정] get 뒤에 <DashboardSummaryDto> 타입을 명시해주면 더 안전합니다.
    const response = await apiClient.get<ApiResponse<DashboardDto>>('/api/dashboard');
    return response.data.data;
  }
};
