import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '플랜두씨 — 계획부터 돌아보기까지',
  description: '나의 계획, 실제 실행 기록, 돌아보기를 연결하는 나만의 플랜두씨 다이어리',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
