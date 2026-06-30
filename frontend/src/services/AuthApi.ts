import { apiClient } from './apiClient';

// ===================================================================
// 🧱 1. 백엔드 공통 응답 규격(ApiResponse) 및 데이터 인터페이스 정의
// ===================================================================
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface WithdrawData {
  password: string;
}

// ✉️ 이메일 도메인 전용 깔끔한 DTO 규격 정의
export interface EmailVerificationData {
  email: string;
}

export interface EmailCodeCheckData {
  email: string;
  verificationCode: string;
}

export interface PasswordResetEmailData {
  email: string;
}

export interface PasswordResetSubmitData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  accessToken: string;
}

export const OAuth2Urls = {
  google: `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`,
  naver: `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/naver`,
};

// ===================================================================
// 🚀 2. 통합 회원 인증 및 이메일 인프라 API 정의 (최종 교정본)
// ===================================================================
export const AuthApi = {

  // -----------------------------------------------------------------
  // 📩 [이메일 인증 및 패스워드 재설정 도메인: /api/email]
  // -----------------------------------------------------------------

  /**
   * 1-1. 회원가입용 인증번호 메일 발송 요청
   * 👉 ⭕ 백엔드 엔드포인트: /api/email/verify-request
   */
  requestEmailCode: async (request: EmailVerificationData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/api/email/verify-request', request);
    return response.data.data;
  },

  /**
   * 1-2. 회원가입용 인증번호 백엔드 Redis 대조 검증
   * 👉 ⭕ 백엔드 엔드포인트: /api/email/verify-check
   */
  verifyEmailCode: async (request: EmailCodeCheckData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/api/email/verify-check', request);
    return response.data.data;
  },

  /**
   * 2-1. 비밀번호 찾기 - 재설정 링크 이메일 발송 요청
   */
  requestPasswordReset: async (request: PasswordResetEmailData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/api/email/password-reset-request', request);
    return response.data.data;
  },

  /**
   * 2-2. 비밀번호 찾기 - 메일 링크 클릭 후 새 비밀번호로 최종 갱신
   */
  resetPasswordSubmit: async (request: PasswordResetSubmitData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/api/email/password-reset-submit', request);
    return response.data.data;
  },

  // -----------------------------------------------------------------
  // 🔐 [기존 로컬 회원 관리 도메인: /api/auth]
  // -----------------------------------------------------------------

  /**
   * 1-3. 최종 회원가입 완료 승인
   */
  register: async (registerRequestDto: RegisterData): Promise<string> => {
    const response = await apiClient.post<ApiResponse<string>>('/api/auth/register', registerRequestDto);
    return response.data.data;
  },

  /**
   * 3. 로컬 시스템 로그인
   */
  login: async (loginRequest: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
        '/api/auth/login',
        loginRequest,
        { withCredentials: true }
    );
    return response.data.data;
  },

  /**
   * 4. 마이페이지 내 비밀번호 변경 (로그인 인증 상태)
   */
  changePassword: async (request: ChangePasswordData): Promise<string> => {
    const response = await apiClient.put<ApiResponse<string>>('/api/auth/password', request);
    return response.data.data;
  },

  /**
   * 5. 일반 로컬 유저 탈퇴 (비밀번호 검증 동반)
   */
  deleteUser: async (request: WithdrawData): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>('/api/auth/me', {
      data: request,
      withCredentials: true
    });
    return response.data.data;
  },

  /**
   * 6. 소셜 로그인 연동 유저 탈퇴 (비밀번호 불필요)
   */
  deleteOAuthUser: async (): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
        '/api/oauth2/withdraw',
        { withCredentials: true }
    );
    return response.data.data;
  }
};