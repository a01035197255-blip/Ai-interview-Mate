export default function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="spinner"></div> {/* CSS 스피너 애니메이션 */}
            <h2 style={{ marginTop: '20px', color: '#333', fontWeight: '600' }}>
                로그인 중입니다. 잠시만 기다려 주세요...
            </h2>
        </div>
    );
}