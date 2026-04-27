# KOOsca — 구영민必학원 관리형 독서실

관리형 독서실 학습 관리 시스템 — 학생·학부모·관리자가 한 화면에서 같은 그림을 봅니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Realtime)
- **배포**: Vercel

## 주요 기능

### 관리자
- 실시간 학생 현황 모니터링 (학습/외출/수면/하원 상태)
- 학생 관리 (등록, 상태 변경, 메모)
- 일일 하원 보고서 작성 및 학부모 발송
- 교재 관리
- 공지사항 작성

### 학생
- 학습 타이머 (일/주/월 누적 기록)
- Daily Plan (과목별 할 일 관리, 달성률)
- 학습 통계 (주간/월간 차트)
- 오늘의 회고
- 공지사항 확인

### 학부모
- 자녀 실시간 학습 현황
- 일일 학습 보고서 확인
- 주간 학습 통계
- 케어톡 (관리자와 1:1 소통)

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일에 Supabase 프로젝트 정보를 입력합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase 데이터베이스 설정

Supabase 대시보드 > SQL Editor에서 `supabase-schema.sql` 파일의 내용을 실행합니다.

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

### 4. 배포 (Vercel)

```bash
vercel --prod
```

## 역할별 접속

| 역할 | URL |
|------|-----|
| 관리자 | `/login?role=admin` |
| 학생 | `/login?role=student` |
| 학부모 | `/login?role=parent` |

## 라이선스

Private — 구영민必학원 전용
