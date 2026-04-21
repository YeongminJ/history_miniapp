# AIT — 한국사 퀴즈 미니앱 기획 문서

> Apps-in-Toss 기반 한국사 퀴즈 게임 미니앱.
> 이 문서는 개발 착수 전 논의 내용을 정리한 것이며, 결정 사항이 바뀌면 업데이트한다.

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 플랫폼 | Apps-in-Toss (Toss 앱 내 미니앱) |
| 주제 | 한국사 학습 + 게임 퀴즈 |
| 타깃 | 한국사 학습에 관심 있는 일반 사용자 (수능·한능검 준비생 포함) |
| 기준일 | 2026-04-20 |

### 제약 조건

- 디자인 리소스 확보 어려움 → **무료 리소스 + AI 생성** 범위 내에서 진행
- 개인 개발, MVP 위주로 빠르게 출시 후 iteration

## 2. 기술 스택 결정사항

| 영역 | 결정 | 비고 |
|---|---|---|
| 플랫폼 | **Web (@apps-in-toss/web-framework)** ✅ | RN 대비 개발 속도·디버깅·배포 모두 유리 |
| UI 컴포넌트 | `@toss/tds-mobile` (TDS) | 비게임 미니앱 심사 요구사항 |
| 언어 | TypeScript | — |
| 번들러 | Vite | 핫리로드 빠름 |
| 상태 관리 | zustand (예정) | 간단한 전역 상태 |
| 애니메이션 | framer-motion | 게임 이펙트·전환 |
| 저장소 | 로컬 (Bridge Storage / localStorage) | MVP는 로컬만, 랭킹 도입 시 서버 검토 |
| 카테고리 | 비게임 유틸앱(학습) | TDS 필수, 심사 용이 |

### Web vs RN 분석 요약

고려 게임 모드(기본 타이머+HP+콤보 / 낙하형 / 카드 매칭 / 타임라인 드래그 / 보스전) 기준:

| 항목 | Web | RN |
|---|---|---|
| 60fps 애니메이션 | 최신폰 문제없음, 구형 안드로이드 약간 리스크 | 안정적 |
| 3D 카드 뒤집기 | CSS `transform: rotateY` 한 줄 | reanimated, 약간 복잡 |
| 드래그 제스처 | pointer events + dnd-kit | gesture-handler 약간 매끄러움 |
| 개발 속도 | Vite 초고속, 즉시 디버깅 | Metro 느림, 디바이스 빌드 필요 |
| 번들 크기 | 작음 (심사 용이) | 큼 |
| 네이티브 API | 기본(저장·햅틱·공유) | 풍부(퀴즈앱엔 과함) |

**결론**: 퀴즈 앱 수준의 게임성은 웹으로 충분. 혼자 빠르게 iteration 하기엔 웹이 압도적으로 유리.

## 3. 콘텐츠 현황

`content/quiz/` 디렉토리 — **한국사 1,000문제** 완비.

| 시대 | 문제 수 | 비고 |
|---|---|---|
| 고대 (선사~남북국) | 200 | A001~A200 |
| 고려 (918~1392) | 200 | G001~G200 |
| 조선 (1392~1863) | 300 | J001~J300 |
| 근대 (1876~1945) | 200 | M001~M200 |
| 현대 (1945~) | 100 | C001~C100 |
| **합계** | **1,000** | — |

**난이도**: easy 300 / medium 500 / hard 200

**검수 결과 (2명 독립 병렬 × 2회차)**: critical 0 / major 0 (모두 교정 완료) → **출시 가능 수준**

각 문제 스키마: `id`, `period`, `tags[]`, `difficulty`, `question`, `choices[4]`, `answerIndex`, `explanation`.

## 4. MVP v0.1 범위 (제안 — 미확정)

### 포함

- 홈 화면 — 오늘의 퀴즈 시작 / 연속 출석 카운터 / 통계 요약
- **기본 게임 모드** — 타이머(10초) + HP(3목숨) + 콤보(×점수 배율)
- 4지선다 + 즉시 채점 + 해설 토글 (해설만 보고 학습 가능)
- 결과 화면 — 점수·정답률·틀린 문제 다시 보기
- 로컬 저장 — 푼 문제 기록 / 통계 / 연속 출석일
- TDS 기반 UI + framer-motion 이펙트

### v0.2 이후로 미룸

- 시대/난이도 필터
- 배지/업적 시스템
- 랭킹 (서버 필요)
- 푸시 알림
- 추가 게임 모드 (낙하형 / 카드 매칭 / 타임라인 드래그)

## 5. 프로젝트 이름 후보 (미결정)

- **한사일공 (한史1000)** — 한국사 1000문제 직관적
- **오늘의 한국사** — 일일 퀴즈 포지션 분명
- **타임어택: 한국사** — 게임성 강조
- **역사의 문** — 감성적 학습 톤
- **한국사 콤보** — 게임성 + 과목 명시
- **찐역사** — 캐주얼 톤
- **히스톡 (histoK)** — 영문 브랜드, 확장성

## 6. v0.1 추가 게임 모드 옵션 (미결정)

기본 모드만 가는 것이 안정적이지만, 하나 추가한다면:

| 옵션 | 특징 | 리스크 |
|---|---|---|
| A. 낙하형 선택지 | 중독성·재미 ↑ | 구형 안드로이드 성능 리스크 |
| B. 카드 매칭 (시대↔인물) | 구현 쉬움, 학습 효과 ↑ | 게임성 보통 |
| C. **보스전 (10문제 챕터)** | 기본 모드 엔진 재사용, 몰입감 ↑ | **추천 — 가성비 최고** |

## 7. 디자인 리소스 계획 (무료 범위)

| 용도 | 리소스 |
|---|---|
| UI 컴포넌트 | TDS Mobile |
| 일러스트 | [unDraw](https://undraw.co) (MIT, 색상 커스텀) + [Storyset](https://storyset.com) |
| 아이콘 | [Iconify](https://icon-sets.iconify.design) (200k+ 오픈소스 아이콘) |
| 역사 인물·유물 이미지 | 위키미디어 커먼즈 (퍼블릭 도메인) |
| AI 생성 | Claude(카피·문항), Bing Image Creator / Leonardo.ai(일러스트) |

## 8. 개발 환경 (세팅 완료)

- `ax` CLI 0.5.1 (`/opt/homebrew/bin/ax`) — `brew tap toss/tap && brew install ax`
- Claude Code MCP 서버 `apps-in-toss` 연동 — `claude mcp add --transport stdio apps-in-toss ax mcp start`
- Claude Code 플러그인 `knowledge-skills@apps-in-toss-skills` 설치 완료

## 9. 확정 사항 (2026-04-21)

- **프로젝트 이름**: **내가역사왕** (appName: `my-history-king`)
- **앱 카테고리**: 비게임 유틸앱(학습) + 게임 인터랙션 (TDS 베이스)
- **MVP v0.1 범위**: 홈 / 기본 게임 모드(타이머 10초 + HP 3 + 콤보) / 4지선다 + 해설 토글 / 결과 화면(해설 중심) / 로컬 저장
- **UX 방향**: **RPG 던전형** — 인물·상황이 등장해 말풍선으로 출제, 정답=적 데미지, 오답=내 HP 차감. 시대별 챕터(맵) → 방 → 보스.
- **추가 게임 모드 (Q3)**: 보류 (v0.1 이후 결정)

## 10. 앱 스캐폴딩 (2026-04-21)

- 위치: [app/](../app/)
- 명령: `npx create-ait-app@latest app --inline --tds --skills --ai claude`
- 스택:
  - `@apps-in-toss/web-framework` v2.4.7
  - `@toss/tds-mobile` v2.3.0 (+ `@toss/tds-mobile-ait` v2.3.0 Provider)
  - React 18 + TypeScript + Vite 6 + Emotion 11
  - 스킬 문서: [app/docs/skills/apps-in-toss.md](../app/docs/skills/apps-in-toss.md), [app/docs/skills/tds-mobile.md](../app/docs/skills/tds-mobile.md)
- 설정: [granite.config.ts](../app/granite.config.ts) — appName `my-history-king`, displayName `내가역사왕`, primaryColor `#5D4037`
- 개발 서버: `cd app && npm run dev` (기본 포트 5173)
- 샌드박스 앱 접속: `intoss://my-history-king`

## 11. 결정 로그

| 일자 | 결정 | 비고 |
|---|---|---|
| 2026-04-20 | Apps-in-Toss 개발환경 세팅 (ax + MCP + plugin) | |
| 2026-04-20 | 비게임 유틸앱 카테고리로 진행 | TDS 필수 |
| 2026-04-20 | 무료 리소스 + AI 생성 범위로 한정 | |
| 2026-04-20 | 한국사 1,000문제 생성 + 이중 검수 완료 | content/quiz/ |
| 2026-04-20 | 플랫폼 = Web (@apps-in-toss/web-framework) | RN 대비 장점 명확 |
| 2026-04-21 | 프로젝트 이름 = 내가역사왕 | appName=my-history-king |
| 2026-04-21 | UX 방향 = RPG 던전형 퀴즈 | 인물 등장·말풍선 출제·HP 데미지 |
| 2026-04-21 | MVP v0.1 범위 확정 | 홈/기본모드/해설/결과/로컬저장 |
| 2026-04-21 | 앱 스캐폴딩 완료 (app/) | create-ait-app + TDS + Claude skills |
