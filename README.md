# GYM · 웹 PWA

GitHub Pages(`https://qkrwpdlr.github.io/gym/`)로 배포되는 GYM 웹 앱.

이 레포의 `index.html`, `assets/`, `fonts/`, `service-worker.js`, `manifest.json`,
아이콘은 **빌드 결과물**이다. 직접 고치지 말고, 원본 소스인 `gym-ios/WebApp`
(React + Vite)을 고친 뒤 빌드해서 덮어쓴다.

## 배포

```bash
cd ../gym-ios/WebApp
npm install
npm run build:pages   # → 이 레포 루트로 빌드 결과물을 복사
cd ../../gym
git add -A && git commit -m "Update web build" && git push
```

`build:pages`는 이전 빌드 결과물만 교체하고 `docs/`, `mockups/`, `server/`는
건드리지 않는다. 서비스워커 캐시 이름이 빌드마다 바뀌므로, 이미 설치된 PWA도
다음 실행 때 새 버전을 받는다.

## 웹 버전에서 되는 것 / 안 되는 것

- 루틴 체크리스트, 집중 모드, 휴식 타이머, 기록 캘린더, 루틴 템플릿, 기록 내보내기/가져오기
- 오프라인 동작 (서비스워커)
- 운동 기록은 브라우저 localStorage(`gym-v4-*`)에 저장된다. 예전 버전 기록도 그대로 이어진다.
- **gymbro 코치는 iOS 앱 전용**이다. 코치는 Sign in with Apple 로그인이 필요해서,
  웹에서는 "코치는 iOS 앱에서 쓸 수 있어요" 안내만 나온다.

## 로컬 확인

```bash
python3 -m http.server 8000
# localhost:8000 접속
```

## 폰에 설치

**iOS (Safari)**: 주소 접속 → 하단 공유 → **"홈 화면에 추가"**

**Android (Chrome)**: 접속 → 주소창 ⋮ → **"앱 설치"**
