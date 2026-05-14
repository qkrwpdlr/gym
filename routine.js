// 5일 루틴 데이터
// 구조: days[dayId] = { title, day, color, sections: [{ title, meta, rest, sets: [{ name, weight, unit, reps }] }] }
window.ROUTINE = {
  day1: {
    title: 'SQUAT + BENCH',
    day: 'MON',
    tag: 'HEAVY SQUAT · BENCH VOLUME',
    color: '#ff2d2d',
    sections: [
      {
        title: '워밍업 · 스쿼트',
        meta: '폼 확인 · 힘쓰지 말기',
        rest: 60,
        sets: [
          { label: 'W1', name: '로우바 스쿼트', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: '로우바 스쿼트', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W3', name: '로우바 스쿼트', weight: '100', unit: 'kg', reps: '3' },
          { label: 'W4', name: '로우바 스쿼트', weight: '130', unit: 'kg', reps: '2' },
          { label: 'W5', name: '로우바 스쿼트', weight: '150', unit: 'kg', reps: '1' },
          { label: 'W6', name: '로우바 스쿼트', weight: '170', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '스쿼트 탑셋',
        meta: 'RPE 8 · 절대 실패 X',
        rest: 300,
        sets: [
          { label: 'TOP', name: '로우바 스쿼트', weight: '180', unit: 'kg', reps: '3' },
        ]
      },
      {
        title: '스쿼트 백오프',
        meta: '바속도 유지',
        rest: 240,
        sets: [
          { label: 'B1', name: '로우바 스쿼트', weight: '160', unit: 'kg', reps: '5' },
          { label: 'B2', name: '로우바 스쿼트', weight: '160', unit: 'kg', reps: '5' },
          { label: 'B3', name: '로우바 스쿼트', weight: '160', unit: 'kg', reps: '5' },
          { label: 'B4', name: '로우바 스쿼트', weight: '160', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '벤치프레스',
        meta: '볼륨 데이',
        rest: 180,
        sets: [
          { label: 'W1', name: '벤치 워밍업', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W2', name: '벤치 워밍업', weight: '80', unit: 'kg', reps: '3' },
          { label: 'M1', name: '벤치프레스', weight: '100', unit: 'kg', reps: '6' },
          { label: 'M2', name: '벤치프레스', weight: '100', unit: 'kg', reps: '6' },
          { label: 'M3', name: '벤치프레스', weight: '100', unit: 'kg', reps: '6' },
          { label: 'M4', name: '벤치프레스', weight: '100', unit: 'kg', reps: '6' },
          { label: 'M5', name: '벤치프레스', weight: '100', unit: 'kg', reps: '6' },
        ]
      },
      {
        title: '펜들레이 로우',
        meta: '폭발적으로',
        rest: 150,
        sets: [
          { label: 'P1', name: '펜들레이 로우', weight: '110', unit: 'kg', reps: '8' },
          { label: 'P2', name: '펜들레이 로우', weight: '110', unit: 'kg', reps: '8' },
          { label: 'P3', name: '펜들레이 로우', weight: '110', unit: 'kg', reps: '8' },
          { label: 'P4', name: '펜들레이 로우', weight: '110', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '레그 익스텐션',
        meta: '쿼드 마무리',
        rest: 60,
        sets: [
          { label: 'L1', name: '레그 익스텐션', weight: '', unit: '', reps: '15' },
          { label: 'L2', name: '레그 익스텐션', weight: '', unit: '', reps: '15' },
          { label: 'L3', name: '레그 익스텐션', weight: '', unit: '', reps: '15' },
          { label: 'L4', name: '레그 익스텐션', weight: '', unit: '', reps: '15' },
        ]
      },
      {
        title: '행잉 레그레이즈',
        meta: '코어',
        rest: 60,
        sets: [
          { label: 'C1', name: '행잉 레그레이즈', weight: '', unit: '', reps: '15' },
          { label: 'C2', name: '행잉 레그레이즈', weight: '', unit: '', reps: '15' },
          { label: 'C3', name: '행잉 레그레이즈', weight: '', unit: '', reps: '15' },
          { label: 'C4', name: '행잉 레그레이즈', weight: '', unit: '', reps: '15' },
        ]
      }
    ]
  },

  day2: {
    title: 'UPPER HYPER',
    day: 'TUE',
    tag: 'UPPER · 상체 비대',
    color: '#3da5ff',
    sections: [
      {
        title: 'OHP',
        meta: '메인 프레스 · 폼 유지',
        rest: 180,
        sets: [
          { label: 'W1', name: 'OHP 워밍업', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: 'OHP 워밍업', weight: '50', unit: 'kg', reps: '5' },
          { label: 'W3', name: 'OHP 워밍업', weight: '60', unit: 'kg', reps: '3' },
          { label: 'M1', name: 'OHP', weight: '72.5', unit: 'kg', reps: '6' },
          { label: 'M2', name: 'OHP', weight: '72.5', unit: 'kg', reps: '6' },
          { label: 'M3', name: 'OHP', weight: '72.5', unit: 'kg', reps: '6' },
          { label: 'M4', name: 'OHP', weight: '72.5', unit: 'kg', reps: '6' },
        ]
      },
      {
        title: '풀업',
        meta: '컨트롤된 풀 ROM',
        rest: 120,
        sets: [
          { label: 'PU1', name: '풀업', weight: 'BW', unit: '', reps: '10–12' },
          { label: 'PU2', name: '풀업', weight: 'BW', unit: '', reps: '10–12' },
          { label: 'PU3', name: '풀업', weight: 'BW', unit: '', reps: '10–12' },
          { label: 'PU4', name: '풀업', weight: 'BW', unit: '', reps: '10–12' },
        ]
      },
      {
        title: '인클라인 벤치',
        meta: '상부 가슴',
        rest: 120,
        sets: [
          { label: 'I1', name: '인클라인 벤치', weight: '80', unit: 'kg', reps: '8' },
          { label: 'I2', name: '인클라인 벤치', weight: '80', unit: 'kg', reps: '8' },
          { label: 'I3', name: '인클라인 벤치', weight: '80', unit: 'kg', reps: '8' },
          { label: 'I4', name: '인클라인 벤치', weight: '80', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '체스트 서포티드 로우',
        meta: '머신 · 헤비',
        rest: 90,
        sets: [
          { label: 'R1', name: '체스트 서포티드 로우', weight: 'HEAVY', unit: '', reps: '10' },
          { label: 'R2', name: '체스트 서포티드 로우', weight: 'HEAVY', unit: '', reps: '10' },
          { label: 'R3', name: '체스트 서포티드 로우', weight: 'HEAVY', unit: '', reps: '10' },
          { label: 'R4', name: '체스트 서포티드 로우', weight: 'HEAVY', unit: '', reps: '10' },
        ]
      },
      {
        title: '케이블 레터럴',
        meta: '어깨 비대',
        rest: 60,
        sets: [
          { label: 'LT1', name: '케이블 레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT2', name: '케이블 레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT3', name: '케이블 레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT4', name: '케이블 레터럴 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'LT5', name: '케이블 레터럴 레이즈', weight: '', unit: '', reps: '15' },
        ]
      },
      {
        title: 'EZ 컬',
        meta: '이두',
        rest: 60,
        sets: [
          { label: 'BI1', name: 'EZ 컬', weight: '', unit: '', reps: '12' },
          { label: 'BI2', name: 'EZ 컬', weight: '', unit: '', reps: '12' },
          { label: 'BI3', name: 'EZ 컬', weight: '', unit: '', reps: '12' },
          { label: 'BI4', name: 'EZ 컬', weight: '', unit: '', reps: '12' },
        ]
      },
      {
        title: '푸시다운',
        meta: '삼두',
        rest: 60,
        sets: [
          { label: 'TR1', name: '푸시다운', weight: '', unit: '', reps: '12' },
          { label: 'TR2', name: '푸시다운', weight: '', unit: '', reps: '12' },
          { label: 'TR3', name: '푸시다운', weight: '', unit: '', reps: '12' },
          { label: 'TR4', name: '푸시다운', weight: '', unit: '', reps: '12' },
        ]
      }
    ]
  },

  day3: {
    title: 'DEADLIFT',
    day: 'WED',
    tag: 'POSTERIOR · 데드 강도',
    color: '#ffdd00',
    sections: [
      {
        title: '데드 워밍업',
        meta: '신경계 자극만',
        rest: 120,
        sets: [
          { label: 'W1', name: '데드리프트', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W2', name: '데드리프트', weight: '100', unit: 'kg', reps: '3' },
          { label: 'W3', name: '데드리프트', weight: '140', unit: 'kg', reps: '2' },
          { label: 'W4', name: '데드리프트', weight: '180', unit: 'kg', reps: '1' },
          { label: 'W5', name: '데드리프트', weight: '200', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '데드 탑싱글',
        meta: 'RPE 8~9 · 허리 컨디션 우선',
        rest: 300,
        sets: [
          { label: 'TOP', name: '데드리프트', weight: '220', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '데드 백오프',
        meta: '볼륨 절대 과하게 X',
        rest: 240,
        sets: [
          { label: 'B1', name: '데드리프트', weight: '190', unit: 'kg', reps: '3' },
          { label: 'B2', name: '데드리프트', weight: '190', unit: 'kg', reps: '3' },
          { label: 'B3', name: '데드리프트', weight: '190', unit: 'kg', reps: '3' },
        ]
      },
      {
        title: '스티프 레그 데드',
        meta: '후면사슬',
        rest: 150,
        sets: [
          { label: 'S1', name: '스티프 레그 데드', weight: '120', unit: 'kg', reps: '8' },
          { label: 'S2', name: '스티프 레그 데드', weight: '125', unit: 'kg', reps: '8' },
          { label: 'S3', name: '스티프 레그 데드', weight: '130', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '워킹 런지',
        meta: '한쪽씩',
        rest: 90,
        sets: [
          { label: 'WL1', name: '워킹 런지', weight: '', unit: '', reps: '10' },
          { label: 'WL2', name: '워킹 런지', weight: '', unit: '', reps: '10' },
          { label: 'WL3', name: '워킹 런지', weight: '', unit: '', reps: '10' },
        ]
      },
      {
        title: '햄스트링 컬',
        meta: '햄 마무리',
        rest: 60,
        sets: [
          { label: 'H1', name: '햄스트링 컬', weight: '', unit: '', reps: '12' },
          { label: 'H2', name: '햄스트링 컬', weight: '', unit: '', reps: '12' },
          { label: 'H3', name: '햄스트링 컬', weight: '', unit: '', reps: '12' },
          { label: 'H4', name: '햄스트링 컬', weight: '', unit: '', reps: '12' },
        ]
      }
    ]
  },

  day4: {
    title: 'BENCH INTENSITY',
    day: 'THU',
    tag: 'UPPER · 벤치 강도 + 파워',
    color: '#c77dff',
    sections: [
      {
        title: '워밍업 · 벤치',
        meta: '신경계 자극',
        rest: 90,
        sets: [
          { label: 'W1', name: '벤치 워밍업', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: '벤치 워밍업', weight: '40', unit: 'kg', reps: '5' },
          { label: 'W3', name: '벤치 워밍업', weight: '60', unit: 'kg', reps: '3' },
          { label: 'W4', name: '벤치 워밍업', weight: '80', unit: 'kg', reps: '2' },
          { label: 'W5', name: '벤치 워밍업', weight: '100', unit: 'kg', reps: '1' },
          { label: 'W6', name: '벤치 워밍업', weight: '115', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '컴페티션 벤치 탑싱글',
        meta: 'RPE 8~9 · 폼 무너지면 STOP',
        rest: 240,
        sets: [
          { label: 'TOP', name: '컴페티션 벤치', weight: '122.5', unit: 'kg', reps: '1' },
        ]
      },
      {
        title: '벤치 백오프',
        meta: '폭발적으로',
        rest: 180,
        sets: [
          { label: 'B1', name: '컴페티션 벤치', weight: '105', unit: 'kg', reps: '4' },
          { label: 'B2', name: '컴페티션 벤치', weight: '105', unit: 'kg', reps: '4' },
          { label: 'B3', name: '컴페티션 벤치', weight: '105', unit: 'kg', reps: '4' },
          { label: 'B4', name: '컴페티션 벤치', weight: '105', unit: 'kg', reps: '4' },
          { label: 'B5', name: '컴페티션 벤치', weight: '105', unit: 'kg', reps: '4' },
        ]
      },
      {
        title: '클로즈그립 벤치',
        meta: '삼두 강화',
        rest: 150,
        sets: [
          { label: 'CG1', name: '클로즈그립 벤치', weight: '95', unit: 'kg', reps: '6' },
          { label: 'CG2', name: '클로즈그립 벤치', weight: '95', unit: 'kg', reps: '6' },
          { label: 'CG3', name: '클로즈그립 벤치', weight: '95', unit: 'kg', reps: '6' },
          { label: 'CG4', name: '클로즈그립 벤치', weight: '95', unit: 'kg', reps: '6' },
        ]
      },
      {
        title: '바벨 로우',
        meta: '등 볼륨',
        rest: 120,
        sets: [
          { label: 'BR1', name: '바벨 로우', weight: '105', unit: 'kg', reps: '8' },
          { label: 'BR2', name: '바벨 로우', weight: '105', unit: 'kg', reps: '8' },
          { label: 'BR3', name: '바벨 로우', weight: '105', unit: 'kg', reps: '8' },
          { label: 'BR4', name: '바벨 로우', weight: '105', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '풀업',
        meta: 'AMRAP · 등 마무리',
        rest: 120,
        sets: [
          { label: 'PU1', name: '풀업', weight: 'BW', unit: '', reps: 'AMRAP' },
          { label: 'PU2', name: '풀업', weight: 'BW', unit: '', reps: 'AMRAP' },
          { label: 'PU3', name: '풀업', weight: 'BW', unit: '', reps: 'AMRAP' },
        ]
      },
      {
        title: '리어델트 머신',
        meta: '뒷어깨',
        rest: 45,
        sets: [
          { label: 'RD1', name: '리어델트 머신', weight: '', unit: '', reps: '15' },
          { label: 'RD2', name: '리어델트 머신', weight: '', unit: '', reps: '15' },
          { label: 'RD3', name: '리어델트 머신', weight: '', unit: '', reps: '15' },
          { label: 'RD4', name: '리어델트 머신', weight: '', unit: '', reps: '15' },
          { label: 'RD5', name: '리어델트 머신', weight: '', unit: '', reps: '15' },
        ]
      }
    ]
  },

  day5: {
    title: 'SQUAT VOLUME',
    day: 'FRI',
    tag: 'LOWER · 스쿼트 볼륨/테크닉',
    color: '#00ff88',
    sections: [
      {
        title: '워밍업',
        meta: '관절 풀기',
        rest: 60,
        sets: [
          { label: 'W1', name: '스쿼트 워밍업', weight: 'BAR', unit: 'kg', reps: '10' },
          { label: 'W2', name: '스쿼트 워밍업', weight: '60', unit: 'kg', reps: '5' },
          { label: 'W3', name: '스쿼트 워밍업', weight: '100', unit: 'kg', reps: '3' },
          { label: 'W4', name: '스쿼트 워밍업', weight: '130', unit: 'kg', reps: '2' },
        ]
      },
      {
        title: '포즈 로우바 스쿼트',
        meta: '바텀 2초 정지',
        rest: 180,
        sets: [
          { label: 'M1', name: '포즈 로우바 스쿼트', weight: '145', unit: 'kg', reps: '5' },
          { label: 'M2', name: '포즈 로우바 스쿼트', weight: '145', unit: 'kg', reps: '5' },
          { label: 'M3', name: '포즈 로우바 스쿼트', weight: '145', unit: 'kg', reps: '5' },
          { label: 'M4', name: '포즈 로우바 스쿼트', weight: '145', unit: 'kg', reps: '5' },
          { label: 'M5', name: '포즈 로우바 스쿼트', weight: '145', unit: 'kg', reps: '5' },
        ]
      },
      {
        title: '하이바 스쿼트',
        meta: '쿼드·코어 강화',
        rest: 150,
        sets: [
          { label: 'H1', name: '하이바 스쿼트', weight: '120', unit: 'kg', reps: '8' },
          { label: 'H2', name: '하이바 스쿼트', weight: '120', unit: 'kg', reps: '8' },
          { label: 'H3', name: '하이바 스쿼트', weight: '120', unit: 'kg', reps: '8' },
        ]
      },
      {
        title: '레그 프레스',
        meta: '머신 · 헤비',
        rest: 90,
        sets: [
          { label: 'LP1', name: '레그 프레스', weight: 'HEAVY', unit: '', reps: '12' },
          { label: 'LP2', name: '레그 프레스', weight: 'HEAVY', unit: '', reps: '12' },
          { label: 'LP3', name: '레그 프레스', weight: 'HEAVY', unit: '', reps: '12' },
          { label: 'LP4', name: '레그 프레스', weight: 'HEAVY', unit: '', reps: '12' },
        ]
      },
      {
        title: '카프 레이즈',
        meta: '종아리',
        rest: 60,
        sets: [
          { label: 'CF1', name: '카프 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'CF2', name: '카프 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'CF3', name: '카프 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'CF4', name: '카프 레이즈', weight: '', unit: '', reps: '15' },
          { label: 'CF5', name: '카프 레이즈', weight: '', unit: '', reps: '15' },
        ]
      }
    ]
  }
};
