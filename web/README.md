# GYM 웹 앱 소스 (React + Vite)

레포 루트의 `index.html`, `assets/`, `fonts/`, `service-worker.js` 등은 이 폴더를 빌드한 결과물이다.

## 구조

- `src/routine.json` — 기본 루틴(5분할 + 대체 데이)
- `src/types.ts` — 데이터 모델
- `src/storage.ts` — UI 외 로직(localStorage 기록, 블록 프로그램, 오버라이드, 해시 라우터)
- `src/App.tsx` — 화면(오늘 / 캘린더 / 기록 상세 / 설정, 집중 모드, 휴식 타이머)
- `src/styles.css` — 스타일

## 명령

```sh
npm install
npm run dev          # 로컬 개발 서버
npm run lint
npm run build:pages  # 빌드 → 레포 루트로 결과물 복사
```
