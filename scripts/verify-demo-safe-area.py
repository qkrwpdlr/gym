"""Render the exercise sheet with portrait/landscape safe-area insets.

Chromium uses native env() inset overrides; WebKit simulates their values through
the sheet's CSS variables. This does not replace a physical iPhone PWA check.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
from exercise_motion_catalog import ROOT

CASES = [
    ("no-insets", 375, 629, 0, 0, 0, 0),
    ("portrait", 393, 852, 59, 0, 34, 0),
    ("small-portrait", 375, 629, 47, 0, 34, 0),
    ("landscape", 812, 375, 0, 59, 21, 59),
]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8017")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/qa/safe-area")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    report = []
    with sync_playwright() as pw:
        for engine in ["chromium", "webkit"]:
            browser = getattr(pw, engine).launch(headless=True)
            for name, width, height, top, right, bottom, left in CASES:
                context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
                page = context.new_page()
                if engine == "chromium":
                    context.new_cdp_session(page).send("Emulation.setSafeAreaInsetsOverride", {
                        "insets": {"top": top, "right": right, "bottom": bottom, "left": left}})
                page.goto(args.base_url)
                page.wait_for_load_state("networkidle")
                page.locator(".demo-button").first.click()
                dialog = page.locator("dialog[open]")
                if engine == "webkit":
                    dialog.evaluate("(el,insets)=>{for(const [side,value] of Object.entries(insets))el.style.setProperty('--demo-safe-'+side,value+'px')}",
                                    {"top": top, "right": right, "bottom": bottom, "left": left})
                page.frame_locator("dialog[open] iframe").locator('[data-renderer="articulated-v1"]').wait_for()
                bounds = dialog.bounding_box()
                close = page.get_by_role("button", name="자세 보기 닫기", exact=True)
                button = close.bounding_box()
                frame = dialog.locator("iframe").bounding_box()
                assert bounds["y"] >= top + 11.5, (engine, name, bounds)
                assert button["y"] >= top, (engine, name, button)
                assert button["x"] >= left and button["x"] + button["width"] <= width - right
                assert button["width"] >= 44 and button["height"] >= 44
                assert frame["y"] + frame["height"] <= height - bottom + .5, (engine, name, frame)
                assert frame["height"] > 0
                page.screenshot(path=str(args.output / f"{engine}-{name}.png"))
                close.click()
                assert not page.locator("dialog[open]").count()
                report.append({"browser": engine, "case": name, "insets": [top, right, bottom, left],
                               "sheet": bounds, "close": button, "iframe": frame, "closeClick": True})
                context.close()
            browser.close()
    (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Passed {len(report)} rendered safe-area/close-button checks")


if __name__ == "__main__":
    main()
