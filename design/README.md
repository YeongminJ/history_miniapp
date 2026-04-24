# 역사왕 — 앱인토스 제출용 에셋

모든 이미지는 HTML/CSS로 제작한 뒤 headless Chrome으로 PNG 변환했어요. 소스 HTML을 수정하고 아래 명령을 다시 실행하면 재생성됩니다.

## 최종 파일

| 용도 | 규격 | 파일 | 소스 |
|---|---|---|---|
| 앱 로고 아이콘 | 600×600 | [out/logo.png](./out/logo.png) | [logo.html](./logo.html) |
| 정방형 썸네일 | 1000×1000 | [out/thumbnail-square.png](./out/thumbnail-square.png) | [thumbnail-square.html](./thumbnail-square.html) |
| 가로형 썸네일 | 1932×828 | [out/thumbnail.png](./out/thumbnail.png) | [thumbnail.html](./thumbnail.html) |
| 스크린샷 1 · 홈 | 636×1048 | [out/screenshot-1.png](./out/screenshot-1.png) | [screenshot-1.html](./screenshot-1.html) |
| 스크린샷 2 · 스테이지 | 636×1048 | [out/screenshot-2.png](./out/screenshot-2.png) | [screenshot-2.html](./screenshot-2.html) |
| 스크린샷 3 · 전투 | 636×1048 | [out/screenshot-3.png](./out/screenshot-3.png) | [screenshot-3.html](./screenshot-3.html) |

> 모든 PNG는 투명 배경 없이 배경색이 꽉 채워진 상태로 저장됩니다 (`--default-background-color=3E2723FF`). 앱인토스 검수 가이드상 로고·썸네일은 투명 배경 사용이 불가해요.

## 로고 가이드 준수

[AppsInToss 공식 로고 가이드](https://static.toss.im/appsintoss/AppsInToss_Logo_Guide_600_600.pdf) 기준:

- ✅ 600×600 캔버스
- ✅ 안전영역 380px 내에 주요 콘텐츠(크라운 + "역사왕" + "HISTORY KING") 배치
- ✅ 원형 크롭되어도 핵심 요소 보존되도록 여백 확보
- ✅ 배경 단색/그라디언트, 과도한 외부 요소 없음
- ✅ 원형 골드 링으로 가독성·중심성 강조

## 재생성 명령

```bash
cd design
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=out
BG=3E2723FF # 투명 배경 방지: 기본 배경색을 브랜드 다크 브라운으로 강제

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --default-background-color=$BG \
  --window-size=600,600 --screenshot="$OUT/logo.png" \
  "file://$PWD/logo.html"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --default-background-color=$BG \
  --window-size=1000,1000 --screenshot="$OUT/thumbnail-square.png" \
  "file://$PWD/thumbnail-square.html"

"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --default-background-color=$BG \
  --window-size=1932,828 --screenshot="$OUT/thumbnail.png" \
  "file://$PWD/thumbnail.html"

for n in 1 2 3; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --default-background-color=$BG \
    --window-size=636,1048 --screenshot="$OUT/screenshot-$n.png" \
    "file://$PWD/screenshot-$n.html"
done
```
