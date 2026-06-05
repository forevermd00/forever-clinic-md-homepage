export const metadata = {
  title: '애널리틱스 대시보드 - 포에버의원 명동점',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          background: '#f6f7f9',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#1a1a1a',
        }}
      >
        {children}
      </body>
    </html>
  );
}
