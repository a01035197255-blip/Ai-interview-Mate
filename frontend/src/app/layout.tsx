import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="ko">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased font-sans">
      {children}
      </body>
      </html>
  );
}
