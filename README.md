# GYM · 5 Day Split PWA

체크리스트 + 집중 모드를 갖춘 5일 분할 루틴 트래커.

## 두 가지 모드

### 1. 체크리스트 모드 (메인)
- 전체 루틴 훑어보기
- 개별 세트 탭하면 체크 + 자동 휴식 타이머 (하단 오버레이)
- 섹션별 완료 진행률 표시

### 2. 집중 모드 (FOCUS)
`START WORKOUT` 크게 탭하면 풀스크린 진입:
- **운동 화면**: 종목 + 무게(거대) + reps만
- `DONE · NEXT` 탭 → **쉬는 시간 풀스크린**
- 거대 타이머 + "다음: 170kg × 5" 미리보기
- 마지막 3초 비프 (600Hz) + 타이머 끝 비프+진동 (880→1320Hz)
- 화면 짧게 빨간색 플래시 → 자동으로 다음 세트 화면

## 주요 기능
- 🔴 5일 분할 (Mon–Fri) 하단 탭 네비게이션
- 🔗 해시 라우팅 (`#/day1` ~ `#/day5`)
- 💾 요일별 독립 체크 저장 (localStorage)
- 📱 Wake Lock 자동 활성화 (첫 세트 체크시)
- 🔔 Notification 알림 (백그라운드 복귀시)
- 🔊 Web Audio 비프 (음악 안 멈춤)
- 📳 진동 피드백
- 📶 오프라인 동작 (서비스워커)
- ⏱️ endTime 기반 타이머 (백그라운드 갔다와도 정확)

## 파일 구조
```
gym-pwa/
├── index.html           # 메인 SPA
├── routine.js           # 5일치 루틴 데이터 (수정 여기)
├── service-worker.js    # 오프라인 캐싱
├── manifest.json        # PWA 메타데이터
├── icon-192.png
├── icon-512.png
└── README.md
```

## 로컬 테스트
```bash
cd gym-pwa
python3 -m http.server 8000
# localhost:8000 접속
```
localhost는 HTTPS 없이도 PWA 인정됨.

## GitHub Pages 배포

```bash
cd gym-pwa
git init
git add .
git commit -m "init gym pwa"
git branch -M main
# GitHub에서 새 repo "gym" 생성 후
git remote add origin https://github.com/<USERNAME>/gym.git
git push -u origin main
```

그 다음:
1. 레포 → **Settings** → **Pages**
2. Source: **Deploy from a branch** → **main** / **/ (root)** → Save
3. 1–2분 후 `https://<USERNAME>.github.io/gym/` 접속

## 폰에 설치

**iOS (Safari)**
1. 주소 접속 → 하단 공유 → **"홈 화면에 추가"**

**Android (Chrome)**
1. 접속 → 주소창 ⋮ → **"앱 설치"**

## 루틴 수정

`routine.js` 파일의 `ROUTINE` 객체를 수정하면 됨:
```js
window.ROUTINE = {
  day1: {
    title: 'SQUAT HEAVY',
    day: 'MON',
    tag: 'LOWER · 스쿼트',
    color: '#ff2d2d',  // 테마 컬러
    sections: [
      {
        title: '워밍업',
        meta: '폼 확인',
        rest: 45,  // 휴식 시간 (초)
        sets: [
          { label: 'W1', name: '스쿼트', weight: 'BAR', unit: 'kg', reps: '10' },
          ...
        ]
      }
    ]
  }
}
```

수정 후 다시 `git push` 하면 끝.

## 집중 모드 팁

- **시작 지점 자동 결정**: 체크 안 된 첫 세트부터 시작
- **EXIT** 버튼으로 언제든 나갈 수 있음 (체크는 저장됨)
- 쉬는 시간 중 `SKIP REST` 가능
- 운동 시작하면 Wake Lock 자동 ON → 화면 안 꺼짐
- 폰 잠궈도 복귀하면 타이머 정확함 (endTime 기반)
