# 포에버 의원 명동점 — 공식 홈페이지

포에버 의원 명동점의 공식 웹사이트입니다. 시술 안내, 이벤트/프로모션, Before & After 사례, 의료진 소개, 상담 예약 기능을 제공합니다.

## 기술 스택

| 분류      | 기술                                   |
| --------- | -------------------------------------- |
| Framework | Next.js 16 (App Router)                |
| Language  | TypeScript                             |
| Styling   | Tailwind CSS v4                        |
| CMS       | Sanity v5 (Studio 내장)                |
| Auth      | NextAuth v5 + Drizzle ORM (PostgreSQL) |
| i18n      | next-intl (ko / en / zh / ja)          |
| Form      | React Hook Form + Zod                  |
| Email     | Nodemailer / Resend                    |
| SMS       | NHN Cloud SMS API                      |
| Bot 방지  | Cloudflare Turnstile                   |
| State     | Zustand                                |
| Carousel  | Embla Carousel                         |

## 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 편집 (아래 환경변수 항목 참조)

# 개발 서버 실행
npm run dev
```

개발 서버: [http://localhost:3000](http://localhost:3000)
Sanity Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

## 환경변수

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

# Database (PostgreSQL)
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
AUTH_URL=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_RECIPIENT_EMAIL=

# SMS (NHN Cloud)
NHN_SMS_APP_KEY=
NHN_SMS_SECRET_KEY=
NHN_SMS_SENDER_NO=

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

## 주요 페이지

| 경로                          | 설명                                                     |
| ----------------------------- | -------------------------------------------------------- |
| `/[locale]`                   | 홈 (히어로, 시그니처 프로그램, 이벤트, B&A, 보도자료 등) |
| `/[locale]/treatments`        | 시술 목록 (카테고리별)                                   |
| `/[locale]/treatments/[slug]` | 시술 상세                                                |
| `/[locale]/signature`         | 시그니처 프로그램                                        |
| `/[locale]/promotions`        | 이벤트·프로모션                                          |
| `/[locale]/before-after`      | Before & After 사례                                      |
| `/[locale]/brand`             | 브랜드 소개 (철학, 의료진, 시설, 장비)                   |
| `/[locale]/media`             | 미디어 (보도자료, 블로그, 영상, 공지사항)                |
| `/[locale]/contact`           | 상담 문의                                                |
| `/[locale]/estimate`          | 견적 담기                                                |
| `/[locale]/auth`              | 로그인 / 회원가입 (SMS 인증)                             |
| `/studio`                     | Sanity CMS 관리자                                        |

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

배포 플랫폼: Vercel
CMS: Sanity (프로젝트 ID: `ecoamz42`, dataset: `production`)
