"""Verify every routine demo link in the built app, plus focus and offline use.

Uses isolated headless browser storage. Requires a local HTTP server and Python
Playwright. Does not read or modify the user's installed app data.
"""
import argparse
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
from exercise_motion_catalog import ROOT


def names_in(value):
    if isinstance(value, dict):
        if isinstance(value.get("name"), str):
            yield value["name"].removesuffix(" 워밍업").strip()
        for child in value.values():
            yield from names_in(child)
    elif isinstance(value, list):
        for child in value:
            yield from names_in(child)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8017")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/qa/svg-motion/integration.json")
    args = parser.parse_args()
    recovery = json.loads((ROOT / "web/src/recovery.json").read_text())
    routine = json.loads((ROOT / "web/src/routine.json").read_text())
    demo_source = (ROOT / "web/src/demos.ts").read_text()
    mapping = json.loads(demo_source.split("const DEMOS:", 1)[1].split("=", 1)[1].split("\n}\n", 1)[0] + "\n}")
    expected = (set(names_in(recovery)) | set(names_in(routine))) & set(mapping)
    report = {"routes": 0, "buttons": 0, "openedNames": [], "errors": []}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 629})
        page = context.new_page()
        page.on("pageerror", lambda error: report["errors"].append(str(error)))
        opened = set()
        page.goto(args.base_url)
        for phase, day_count in [(None, len(routine)), *[(i, len(p["days"])) for i, p in enumerate(recovery["phases"])]]:
            state = {"planId": recovery["id"], "phase": phase or 0,
                     "startedOn": "2026-11-14", "phaseStartedOn": "2026-11-14",
                     "ended": "2026-11-14" if phase is None else None}
            page.evaluate("state=>localStorage.setItem('gym-v4-recovery',JSON.stringify(state))", state)
            for slot in range(1, day_count+1):
                page.goto(f"{args.base_url}/#/today/{slot}"); page.reload()
                page.wait_for_selector(".demo-button")
                report["routes"] += 1
                labels = page.locator(".demo-button").evaluate_all("buttons=>buttons.map(b=>b.getAttribute('aria-label'))")
                report["buttons"] += len(labels)
                for label in labels:
                    name = label.removesuffix(" 자세 보기")
                    if name in opened:
                        continue
                    page.get_by_role("button", name=label, exact=True).first.click()
                    iframe = page.frame_locator("dialog[open] iframe")
                    iframe.locator('[data-renderer="articulated-v1"]').wait_for()
                    frame = next(frame for frame in page.frames if "/lab/" in frame.url)
                    frame.wait_for_function("window.__motion")
                    frame.evaluate("__motion.pause(); __motion.seek(__motion.duration * .5)")
                    assert frame.evaluate("document.documentElement.scrollWidth") <= 373
                    assert frame.evaluate("document.documentElement.scrollHeight <= innerHeight")
                    if len(opened) in [0, 10, 20]:
                        page.locator("dialog[open]").evaluate("async el=>{await Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{})))}")
                        page.screenshot(path=str(args.output.parent / f"app-sheet-{len(opened):02}.png"))
                    iframe.locator("#play").press("Escape")
                    page.wait_for_function("!document.querySelector('dialog[open]')")
                    opened.add(name)
                print(f"phase {phase}, day {slot}: {len(labels)} demo buttons", flush=True)
        assert opened == expected, {"missing": sorted(expected-opened), "extra": sorted(opened-expected)}
        report["openedNames"] = sorted(opened)
        report["escapeInsideFrame"] = True

        # Focus mode retains the selected set when a demonstration is dismissed.
        page.goto(f"{args.base_url}/#/today/1")
        page.get_by_role("button", name=re.compile("^운동 시작")).click()
        page.locator(".focus-mode.active").wait_for()
        focus_button = page.locator(".focus-mode.active .demo-button").last
        selected_set = page.locator(".focus-progress-text").inner_text()
        focus_button.click()
        page.frame_locator("dialog[open] iframe").locator('[data-renderer="articulated-v1"]').wait_for()
        page.get_by_role("button", name="자세 보기 닫기", exact=True).click()
        assert focus_button.is_visible()
        assert page.locator(".focus-progress-text").inner_text() == selected_set
        report["focusDemo"] = True

        # Visit once under the installed service worker; the exact versioned
        # renderer dependency must then load with networking disabled.
        page.evaluate("navigator.serviceWorker.ready")
        page.goto(f"{args.base_url}/lab/bench-press.html?embed=1")
        page.wait_for_function("window.__motion")
        context.set_offline(True)
        page.reload()
        page.wait_for_function("window.__motion && document.querySelector('[data-renderer]')")
        report["visitedDemoOffline"] = True
        context.set_offline(False)
        assert not report["errors"], report["errors"]
        browser.close()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Verified {len(opened)} names on {report['routes']} routine screens")


if __name__ == "__main__":
    main()
