import { apiClient } from '@/services/apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export interface QuestionRequestDto {
    question: string;
}

export interface QuestionResponseDto {
    question: string;
    answer: string;
}

export const QuestionApi = {

    askQuestion: async (
        request: QuestionRequestDto
    ): Promise<QuestionResponseDto> => {

        const response = await apiClient.post<
            ApiResponse<QuestionResponseDto>
        >(
            '/api/questions/ask',
            request
        );

        return response.data.data;
    }
};