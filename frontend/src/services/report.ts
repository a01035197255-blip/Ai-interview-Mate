import { apiClient } from './apiClient';

export interface RadarDataDto {
    subject: string;
    score: number;
}

export interface SkillProgressDto {
    title: string;
    score: number;
}

// 백엔드 전체 분석 통계 DTO 규격
export interface ReportSummaryDto {
    averageScore: number;
    scoreChange: string;       // "+4점 상승" 등
    passRate: number;          // 78 등
    tier: string;              // "Advanced", "Beginner" 등
    tierDescription: string;   // "상위 15% 수준의 퍼포먼스 🏆" 등
    radarData: RadarDataDto[];
    weaknesses: SkillProgressDto[];
    strengths: SkillProgressDto[];
}

export const ReportApi = {
    // 누적 통계 리포트 가져오기
    getReportSummary: async (): Promise<ReportSummaryDto> => {
        const response = await apiClient.get('/api/interview_report');
        return response.data;
    }
};
