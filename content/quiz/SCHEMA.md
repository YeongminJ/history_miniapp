# 한국사 퀴즈 콘텐츠 스키마

## 파일 구조
```
content/quiz/
├── SCHEMA.md          # 이 문서
├── ancient.json       # 고대 (선사~남북국시대) — 100문제
├── goryeo.json        # 고려시대 — 100문제
├── joseon.json        # 조선시대 — 150문제
├── modern.json        # 근대 (개항 1876 ~ 광복 1945) — 100문제
├── contemporary.json  # 현대 (1945 ~ 현재) — 50문제
└── index.json         # 메타데이터 및 통합 인덱스
```

## 파일별 JSON 스키마

```typescript
type Difficulty = 'easy' | 'medium' | 'hard';

interface Question {
  id: string;                 // 시대 prefix + 3자리 번호 (예: A001, G001, J001, M001, C001)
  period: string;             // 세부 시대 (예: "삼국시대", "조선 후기")
  tags: string[];             // 분류 태그 (예: ["인물", "전쟁"])
  difficulty: Difficulty;
  question: string;           // 문제
  choices: [string, string, string, string];  // 4지선다
  answerIndex: 0 | 1 | 2 | 3; // 정답 인덱스
  explanation: string;        // 해설 (학습용)
}

interface EraFile {
  era: string;                 // 시대명
  prefix: string;              // id 접두사 (A/G/J/M/C)
  totalQuestions: number;
  difficultyCount: { easy: number; medium: number; hard: number };
  questions: Question[];
}
```

## 난이도 기준
- **easy**: 중학교 수준 핵심 사건/인물 (누구나 아는 것)
- **medium**: 고등학교 한국사 수준 (수능 출제 범위 중상위)
- **hard**: 세부 사료·제도·연도까지 요구하는 심화 문제

## 해설 작성 가이드
- 2~4문장, 정답의 근거 + 관련 배경 지식
- 오답 선지가 혼동되는 이유가 있다면 간단히 언급
- 사용자가 해설만 읽어도 학습이 되도록 작성
