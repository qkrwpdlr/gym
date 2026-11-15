# 운동 자세 시범

오늘 화면의 운동 제목 옆, 집중 모드의 운동 이름 옆 (?)를 누르면 스택 시범을 시트로 연다. 시범은 요청했을 때만 불러오며, 시트를 닫아도 현재 세트와 휴식 타이머는 유지한다.

- 36개 시범 페이지, 각도·등척성·한 발 변형을 합쳐 39개 화면이다. 두 루틴의 운동 이름 중 걷기를 제외한 44개를 연결한다. 기존 T-바 로우 시범도 목록에 유지한다.
- 이름 연결은 `web/src/demos.ts`에 모았다. 세트의 `name`에서 끝의 ` 워밍업`을 제거해 찾는다. 새 운동을 추가하면 이 매핑도 추가한다.
- `lab/articulated-figure.js`가 관절별 인체 윤곽을 그린다. `lab/lineart-demo.js`와 CSS가 타임라인·컨트롤·근육 지도·배치를 담당한다. 관절·기구 해법은 `lab/exercise-kit.js`, 운동별 설명·템포·강도·변형은 `lab/ex/<id>.js`에 있다. 다이버·풀업·T바의 전용 해법도 같은 렌더러를 쓴다.
- 힐 디그 30°, 브릿지 홀드, 슬라이더 한 발 내리기는 URL의 `variant`로 고른다. `embed=1`은 앱 시트 높이에 맞춘 배치다.
- `/lab/`의 HTML·스크립트·스타일·근육 지도는 네트워크 우선이다. 온라인에서 열어 저장된 시범은 오프라인에서도 연다. 처음 여는 시범은 온라인 연결이 필요하다. 스크립트와 스타일 버전 쿼리는 관련 HTML에서 함께 갱신한다.
- 자세와 근육 강도는 근사치이며, 라이선스와 재활 동작 출처는 `lab/credits.html`에 있다.

## 관절 SVG 전환 · 2026-11-14

[Workout Guide](https://bryllim.github.io/workout-guide/exercises/)의 SVG 구조를
조사했다. 조사한 파일은 사람과 기구가 하나의 복합 경로로 합쳐져 있고, 세
프레임의 경로 명령 수가 다르다. 예를 들어 벤치는 197 / 1397 / 218개다.
따라서 관절별 로컬 좌표로 인체와 기구를 새로 제작했다. 참고 경로는 복사하지
않았으며, 이 작업은 모델 가중치를 학습시키는 과정이 아니다.

제작 규칙과 실측 자료는
[exercise-svg-motion 스킬](../.agents/skills/exercise-svg-motion/SKILL.md)에 있다.
스킬을 전달받은 서브에이전트가 스쿼트·RDL·벤치·한 발 브릿지를 제작했다.
독립 리뷰에서 4동작 × 721시점의 경로 구조와 연속성을 확인한 뒤, 전체 시범에
적용했다. 마지막 리뷰 지적에 따라 가려지는 컨트롤과 기구 표현을 수정했다.

- 상·하완, 허벅지·종아리, 몸통, 머리, 손발을 별도 SVG 그룹으로 유지한다.
  각 분절은 관절 좌표에 맞춰 이동·회전하며, 프레임 사이에도 경로 구조가 같다.
- 매 프레임 운동 파라미터를 보간하고 관절을 푼다. 세 그림을 교체하지 않는다.
  발 지지점·벤치·매달린 손·기구 접점은 기존 운동별 해법을 따른다.
- 재생·일시정지·½배속·시간 탐색을 지원한다. 버튼은 그림 아래에 배치해 들어
  올린 팔·다리를 가리지 않는다. reduced motion에서는 자동 재생하지 않는다.
  숨겨진 문서와 정지 상태에서는 렌더 루프를 멈춘다.
  등척성 카운트의 라이브 안내는 실제 문구가 바뀔 때만 갱신한다.
- `window.__motion`은 `duration`, `currentTime`, `playing`, `speed`와
  `seek(seconds)`, `play()`, `pause()`, `setSpeed(value)`를 제공한다.
- `lab/motion/`에 39개 독립 SVG와 `manifest.json`을 저장했다. 37개는 네이티브
  SMIL 반복 애니메이션이고, 힐 디그 두 각도는 등척성 정지 자세다. 앱에서는
  등척성도 시간과 구간 표시가 진행된다.
- 독립 SVG는 실제 렌더러를 초당 20회와 구간 경계에서 표본화한 결과다. 사이
  프레임은 SVG 엔진이 보간하므로, 파일 자체에 실시간 관절 해법은 포함되지
  않는다. 외부 스크립트·스타일·폰트 없이 동작하며, SVG DOM의
  `pauseAnimations()`, `unpauseAnimations()`, `setCurrentTime()`으로 제어한다.
  독립 파일을 넣는 호스트는 사용자의 reduced motion 설정에 맞춰 정지해야 한다.

## 검증 결과

- `cd web && npm run lint && npm run build:pages && npm run test:timer` 통과.
  빌드에 TypeScript 검사가 포함된다.
- Chromium과 WebKit 각각 39개 화면 × 총 3,709시점을 검사했다. 경로 구조,
  유한 좌표, 반복 경계, 화면 넘침, 콘솔 오류가 없었다. 375×572에서 내용이
  들어가는 것을 확인했다. 각 운동 4시점의 렌더 결과는
  [Chromium 프레임 모음](qa/svg-motion/contact-01.png)과
  [WebKit 프레임 모음](qa/svg-motion/webkit/contact-01.png)부터 5장씩 있다.
- 독립 SVG 39개를 각각 세 시점에서 실제 앱 렌더와 이미지 비교했다. RGB
  0~255 기준 평균 차이의 최댓값은 Chromium 0.0821, WebKit 0.0485였다.
- 두 브라우저에서 재생·정지·배속·탐색과 초기/실행 중 reduced motion을 검사했다.
- 빌드한 앱의 기본 루틴과 회복 4단계, 총 19화면의 (?) 버튼 142개를 대조하고
  서로 다른 운동명 44개의 시트를 열고 닫았다. iframe 내 Escape, 집중 모드의
  선택 세트 유지, 방문한 시범의 오프라인 재열기를 확인했다.
- [앱 시트 스크린샷](qa/svg-motion/app-sheet-00.png),
  [Chromium 결과](qa/svg-motion/report.json),
  [WebKit 결과](qa/svg-motion/webkit/report.json),
  [앱 통합 결과](qa/svg-motion/integration.json)를 보관했다.
- 실제 iPhone Safari와 네이티브 SwiftUI 앱에서는 검증하지 않았다. 현재 저장소는
  웹 PWA이며 이번 적용 대상도 웹의 운동 안내 시트다.

## 재생성

PWA 시트는 `safe-area-inset-top` 아래 8px에서 시작하고, 하단 홈 인디케이터
영역은 부모 시트의 패딩으로 제외한다. iframe은 그 안의 높이만 사용하므로
임베드 문서에서 safe area를 다시 더하지 않는다. 닫기 버튼은 44px 이상을 유지한다.
`scripts/verify-demo-safe-area.py`로 세로·가로·작은 화면·여백 없는 화면을
Chromium/WebKit에서 검사했다. Chromium은 실제 `env()` inset override,
WebKit은 CSS 변수에 동일 값을 주입한 검사다. 실제 iPhone PWA 검증은 별도다.
검증 이미지와 위치 값은 `docs/qa/safe-area/`에 있다.

로컬 서버를 실행한 상태에서 Python Playwright와 Pillow가 설치된 환경으로 실행한다.

```bash
python3 -m http.server 8017
# 다른 터미널
python3 scripts/export-exercise-svg.py --base-url http://localhost:8017
python3 scripts/verify-exercise-motion.py --base-url http://localhost:8017
python3 scripts/verify-exercise-motion.py --engine webkit --output docs/qa/svg-motion/webkit
python3 scripts/verify-demo-integration.py --base-url http://localhost:8017
```

SVG 구조와 보간 근거:
[SVG 2 경로 규격](https://www.w3.org/TR/SVG2/paths.html#PathElement),
[SVG Animations 규격](https://svgwg.org/specs/animations/).
참고 그림의 라이선스는 코드 MIT와 별개인
[CC BY-SA 4.0](https://github.com/bryllim/workout-guide/blob/main/LICENSE-ASSETS)이며,
기존 T바 원본 3프레임 비교 페이지는 해당 출처 표시를 유지한다.

배포는 `npm run build:pages`로 루트 산출물을 만든 후 소스와 함께 main에 푸시한다. Pages 빌드 성공과 배포 파일의 일치를 확인하고 실제 배포 주소에서 앱 동작을 다시 검사한다.
