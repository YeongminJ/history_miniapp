# 한국사 퀴즈 콘텐츠

AI 생성 + 이중 독립 검수를 거친 한국사 퀴즈 **1,000문제** 데이터셋. Apps-in-Toss 미니앱(역사 퀴즈 게임)용.

## 구조

| 시대 | 파일 1 | 파일 2 | 합계 | ID 범위 |
|------|--------|--------|-----|---------|
| 고대 (선사~남북국) | [ancient.json](./ancient.json) 100 | [ancient2.json](./ancient2.json) 100 | 200 | A001~A200 |
| 고려 (918~1392) | [goryeo.json](./goryeo.json) 100 | [goryeo2.json](./goryeo2.json) 100 | 200 | G001~G200 |
| 조선 (1392~1863) | [joseon.json](./joseon.json) 150 | [joseon2.json](./joseon2.json) 150 | 300 | J001~J300 |
| 근대 (1876~1945) | [modern.json](./modern.json) 100 | [modern2.json](./modern2.json) 100 | 200 | M001~M200 |
| 현대 (1945~) | [contemporary.json](./contemporary.json) 50 | [contemporary2.json](./contemporary2.json) 50 | 100 | C001~C100 |
| **합계** | **500** | **500** | **1,000** | — |

난이도 분포: **easy 300 / medium 500 / hard 200**

부가 파일:
- [index.json](./index.json) — 전체 메타데이터
- [types.ts](./types.ts) — TypeScript 타입 정의
- [SCHEMA.md](./SCHEMA.md) — 스키마 문서
- [review/](./review/) — 검수 보고서

## 데이터 스키마

```typescript
interface Question {
  id: string;                 // 예: "J042"
  period: string;             // 세부 시대 (예: "조선 후기")
  tags: string[];             // 분류 태그
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;        // 학습용 해설 (2~4문장)
}
```

## 사용 예시

```typescript
import type { EraFile, Question } from './types';
import a1 from './ancient.json';       import a2 from './ancient2.json';
import g1 from './goryeo.json';        import g2 from './goryeo2.json';
import j1 from './joseon.json';        import j2 from './joseon2.json';
import m1 from './modern.json';        import m2 from './modern2.json';
import c1 from './contemporary.json';  import c2 from './contemporary2.json';

const all: Question[] = [a1, a2, g1, g2, j1, j2, m1, m2, c1, c2]
  .flatMap((era) => (era as EraFile).questions);

const easy = all.filter((q) => q.difficulty === 'easy');
const joseonOnly = all.filter((q) => q.id.startsWith('J'));
```

## 난이도 기준

- **easy** (300): 중학교 수준, 누구나 아는 핵심 사건·인물
- **medium** (500): 고등학교 수준 (수능 중상위)
- **hard** (200): 세부 연도·제도·사료까지 요구하는 심화

## 검수 결과 (2명 독립 병렬)

기존 500문제(A001~A100, G001~G100, J001~J150, M001~M100, C001~C050) 대상:

| 검수자 | critical | major | minor | 이상 없음 |
|-------|---------|-------|-------|----------|
| A | 0 | 2 | 5 | 493 |
| B | 0 | 1 | 7 | 492 |

- **critical 오류: 0건** — 출시 가능 수준
- 우선 수정 권장 4건: J080 (장용영 연도, A·B 공통), J100 (이익 육두 표기), J147 (비변사 상설화), G017 (강동 6주 '귀주')
- 상세: [review/consolidated_review.json](./review/consolidated_review.json)

확장 500문제(A101~, G101~, J151~, M101~, C051~)는 아직 검수 미실시.

## 검증 스크립트

```bash
# 전체 1000문제 고유 ID 검증
jq -s 'map(.questions[].id)|{count: length, unique: (unique|length)}' \
  ancient.json ancient2.json goryeo.json goryeo2.json \
  joseon.json joseon2.json modern.json modern2.json \
  contemporary.json contemporary2.json
```

## 주의사항

- AI 생성 콘텐츠. 기존 500은 이중 검수를 거쳤으나 확장 500은 미검수.
- 현대사는 사실 기반 서술로 작성, 평가적 표현 배제.
- 오답 선지도 그럴듯하게 구성(동시대 인물·유사 사건).
