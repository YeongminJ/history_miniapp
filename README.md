# AIT — 한국사 퀴즈 미니앱 (Apps-in-Toss)

> 한국사 1,000문제 기반 학습 + 게임 퀴즈 미니앱. Apps-in-Toss 플랫폼 대상.

## 현재 상태

- ✅ 개발환경 세팅 완료 (`ax` CLI + Claude Code MCP + 플러그인)
- ✅ 한국사 퀴즈 콘텐츠 1,000문제 생성 + 이중 검수 완료
- ⏳ 앱 스캐폴딩 대기 (기획 확정 중)

자세한 기획 내용은 [docs/PLANNING.md](./docs/PLANNING.md) 참조.

## 디렉토리 구조

```
ait/
├── README.md                 # 이 파일
├── docs/
│   └── PLANNING.md           # 기획 문서 (결정 사항·미결정 사항)
└── content/
    └── quiz/                 # 한국사 퀴즈 1,000문제
        ├── ancient.json      # 고대 100
        ├── ancient2.json     # 고대 100
        ├── goryeo.json       # 고려 100
        ├── goryeo2.json      # 고려 100
        ├── joseon.json       # 조선 150
        ├── joseon2.json      # 조선 150
        ├── modern.json       # 근대 100
        ├── modern2.json      # 근대 100
        ├── contemporary.json # 현대 50
        ├── contemporary2.json# 현대 50
        ├── index.json        # 메타데이터
        ├── types.ts          # TypeScript 타입 정의
        ├── SCHEMA.md         # 스키마 문서
        ├── README.md         # 콘텐츠 README
        └── review/           # 검수 보고서
            ├── reviewer_A.json
            ├── reviewer_B.json
            ├── reviewer_A_expansion.json
            ├── reviewer_B_expansion.json
            └── consolidated_review.json
```

## 콘텐츠 요약

- **총 1,000문제** · ID 고유 · 난이도 easy 300 / medium 500 / hard 200
- 시대별: 고대 200, 고려 200, 조선 300, 근대 200, 현대 100
- 검수: 2명 독립 병렬 × 2회차 — critical 0 / major 0 (모두 교정 완료)

## 검증

```bash
jq -s 'map(.questions[].id)|{count: length, unique: (unique|length)}' \
  content/quiz/ancient.json content/quiz/ancient2.json \
  content/quiz/goryeo.json content/quiz/goryeo2.json \
  content/quiz/joseon.json content/quiz/joseon2.json \
  content/quiz/modern.json content/quiz/modern2.json \
  content/quiz/contemporary.json content/quiz/contemporary2.json
# → { "count": 1000, "unique": 1000 }
```

## 기술 스택 (예정)

- `@apps-in-toss/web-framework`
- `@toss/tds-mobile` (TDS)
- React + TypeScript + Vite
- zustand (상태)
- framer-motion (애니메이션)

## 라이선스

- 퀴즈 콘텐츠: AI 생성, 검수 완료. 상업적 사용 시 사실 재검증 권장.
- 이 저장소의 나머지 코드·문서는 향후 라이선스 정책에 따름.
