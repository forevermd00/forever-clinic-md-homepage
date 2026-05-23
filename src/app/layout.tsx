import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://md.foreverclinic.co.kr',
  ),
  title: 'Forever Clinic Myeongdong',
  description: '정교하게 설계된 신뢰의 프리미엄 - 포에버 의원 명동점',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
