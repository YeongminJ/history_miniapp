"""Recolor a teal-themed logo to the app's brown palette.

Pipeline:
1) 디자인 마스크 추출 — 청록 배경/흰 모서리는 0, 디자인 요소(책·왕관·배너·텍스트)는 255.
2) 어두운 청록(텍스트·외곽선)만 다크 브라운으로 hue 치환.
3) 솔리드 브라운 캔버스 위에 디자인 마스크로 합성 → 깔끔한 꽉 찬 사각형.
"""
import colorsys
from pathlib import Path
from PIL import Image

SRC = Path("source/logo-base.png")
OUT_FULL = Path("out/logo.png")            # 600x600 final
OUT_HD = Path("out/logo-base-recolored.png")  # full-res reference

TARGET_BROWN = (108, 73, 58)   # 앱 브라운 (#5D4037 근사)
DARK_BROWN = (62, 39, 35)      # 텍스트·외곽선용

# 청록 배경 기준점
TEAL_RGB = (70, 174, 175)
# 어두운 청록 텍스트/외곽선 기준점
DARK_TEAL_RGB = (42, 90, 85)


def color_distance(c1, c2):
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2) ** 0.5


def design_alpha(r, g, b):
    """0(배경) ~ 255(디자인). 청록 계열·흰색은 배경, 따뜻한 톤만 디자인."""
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)

    # 1) 흰색/회색 (저채도 + 고명도) → 배경
    if s < 0.10 and v > 0.85:
        return 0

    # 2) 밝은 청록 (배경/그림자) → 배경 처리
    #    어두운 청록(텍스트·외곽선)은 디자인으로 유지하고 별도로 색 변환
    if 0.42 <= h <= 0.58 and s > 0.08 and v > 0.45:
        return 0

    # 3) 경계 그라데이션 부드럽게
    teal_d = color_distance((r, g, b), TEAL_RGB)
    white_d = color_distance((r, g, b), (255, 255, 255))
    bg_d = min(teal_d, white_d)
    if bg_d < 60:
        return int(bg_d / 60 * 255)
    return 255


def recolor_dark_teal(r, g, b):
    """어두운 청록(텍스트/외곽선)만 다크 브라운으로 변환. 그 외는 유지."""
    dark_teal_d = color_distance((r, g, b), DARK_TEAL_RGB)
    if dark_teal_d > 60:
        return (r, g, b)
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    # 어두운 청록 영역만 hue 변경
    if v < 0.45 and 0.4 < h < 0.6:
        new_h = 18 / 360
        nr, ng, nb = colorsys.hsv_to_rgb(new_h, s, v)
        return (int(nr * 255), int(ng * 255), int(nb * 255))
    return (r, g, b)


def main():
    base_dir = Path(__file__).parent
    src = base_dir / SRC
    out_full = base_dir / OUT_FULL
    out_hd = base_dir / OUT_HD
    out_full.parent.mkdir(parents=True, exist_ok=True)

    src_img = Image.open(src).convert("RGBA")
    w, h = src_img.size
    src_pixels = src_img.load()

    # 1) 디자인 마스크 + 텍스트 hue 치환
    mask = Image.new("L", (w, h), 0)
    design = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    mask_pixels = mask.load()
    design_pixels = design.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = src_pixels[x, y]
            alpha = design_alpha(r, g, b)
            mask_pixels[x, y] = alpha
            if alpha > 0:
                nr, ng, nb = recolor_dark_teal(r, g, b)
                design_pixels[x, y] = (nr, ng, nb, a)

    # 2) 솔리드 브라운 캔버스 위에 디자인만 합성
    canvas = Image.new("RGBA", (w, h), (*TARGET_BROWN, 255))
    canvas.paste(design, mask=mask)

    canvas.save(out_hd)
    print(f"saved hd: {out_hd}")

    icon = canvas.resize((600, 600), Image.LANCZOS)
    icon.save(out_full)
    print(f"saved icon: {out_full} ({icon.size})")


if __name__ == "__main__":
    main()
