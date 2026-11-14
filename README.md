# GYM · 웹 PWA

GitHub Pages(`https://qkrwpdlr.github.io/gym/`)로 배포되는 GYM 웹 앱.

이 레포 하나로 소스와 배포를 함께 관리한다.

- `web/` — 원본 소스 (React + Vite). 수정은 여기서 한다.
- 루트의 `index.html`, `assets/`, `fonts/`, `service-worker.js`, `manifest.json`, 아이콘 —
  `web/`을 빌드한 **결과물**이다. 직접 고치지 않는다.

## 배포

```bash
cd web
npm install
npm run build:pages   # → 레포 루트로 빌드 결과물을 복사
cd ..
git add web index.html assets fonts service-worker.js manifest.json icon-*.png
git commit -m "Update web build" && git push   # main 푸시 = Pages 배포
```

`build:pages`는 이전 빌드 결과물만 교체하고 다른 파일은 건드리지 않는다.
서비스워커 캐시 이름이 빌드마다 바뀌므로, 이미 설치된 PWA도 다음 실행 때 새 버전을 받는다.

## 기능

- 루틴 체크리스트, 집중 모드, 휴식 타이머, 기록 캘린더, 루틴 템플릿, 기록 내보내기/가져오기
- 오프라인 동작 (서비스워커)
- 운동 기록은 브라우저 localStorage(`gym-v4-*`)에 저장된다.

## 로컬 확인

```bash
python3 -m http.server 8000   # 빌드 결과물 확인: localhost:8000
cd web && npm run dev          # 소스 개발 서버
```

## 폰에 설치

**iOS (Safari)**: 주소 접속 → 하단 공유 → **"홈 화면에 추가"**

**Android (Chrome)**: 접속 → 주소창 ⋮ → **"앱 설치"**
