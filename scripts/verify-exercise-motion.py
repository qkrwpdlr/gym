"""Render and verify production SVG motion, its controls, and native exports.

Requires Python Playwright + Pillow. Run against python3 -m http.server 8017.
Contact sheets and JSON reports are written to the selected output directory.
"""
import argparse
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageStat
from playwright.sync_api import sync_playwright
from exercise_motion_catalog import ROOT, discover

# Exercise the real production timeline, including both sides of phase changes.
SAMPLE = """() => {
  __motion.pause(); const duration=__motion.duration, scene=document.getElementById('scene');
  const nodes=[...scene.querySelectorAll('path')];
  const sig=d=>d.replace(/[-+]?(?:\\d*\\.\\d+|\\d+\\.?\\d*)(?:e[-+]?\\d+)?/gi,'#').replace(/[\\s,]+/g,'');
  const signatures=new Map(); const errors=[]; let boundary=0;
  const times=Array.from({length: Math.ceil(duration*12)+1},(_,i)=>duration*i/Math.ceil(duration*12));
  for(const ph of __demoConfig.phases){ boundary+=ph.dur; for(const delta of [-.001,0,.001])times.push(Math.max(0,Math.min(duration,boundary+delta))) }
  let clipped=0, maxOverflow=0;
  for(const time of times){
    __motion.seek(time);
    if(scene.querySelectorAll('path').length!==nodes.length)errors.push('node-count');
    for(const node of nodes){const d=node.getAttribute('d')||'';if(/NaN|Infinity|undefined/.test(d)) errors.push('non-finite path');
      const signature=sig(d);if(signatures.has(node)&&signatures.get(node)!==signature)errors.push('path topology');signatures.set(node,signature)}
    const box=scene.getBBox(),v=scene.viewBox.baseVal;
    const overflow=Math.max(v.x-box.x,v.y-box.y,box.x+box.width-v.x-v.width,box.y+box.height-v.y-v.height);
    if(overflow>1){clipped++;maxOverflow=Math.max(maxOverflow,overflow)}
  }
  __motion.seek(0);const first=nodes.map(n=>n.getAttribute('d')).join('|');
  __motion.seek(duration);const last=nodes.map(n=>n.getAttribute('d')).join('|');
  if(first!==last)errors.push('loop boundary geometry');
  return {duration,samples:times.length,paths:nodes.length,errors:[...new Set(errors)],clipped,maxOverflow,
    pageHeight:document.documentElement.scrollHeight, width:document.documentElement.scrollWidth,
    articulated:!!scene.querySelector('[data-part="torso"]')};
}"""


def contact_sheets(shots, output):
    for offset in range(0, len(shots), 8):
        batch = shots[offset:offset+8]
        sheet = Image.new("RGB", (4*220, len(batch)*163), "#0b0b0b")
        draw = ImageDraw.Draw(sheet)
        for row, (name, files) in enumerate(batch):
            for col, file in enumerate(files):
                image = Image.open(file).convert("RGB")
                image.thumbnail((216, 137))
                sheet.paste(image, (col*220 + (220-image.width)//2, row*163+22))
                draw.text((col*220+6, row*163+4), f"{name}  {col}/3", fill="#ece8df")
        sheet.save(output / f"contact-{offset//8+1:02}.png")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8017")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/qa/svg-motion")
    parser.add_argument("--screenshots", type=Path, default=Path("/tmp/gym-motion-frames"))
    parser.add_argument("--engine", choices=["chromium", "webkit"], default="chromium")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    args.screenshots.mkdir(parents=True, exist_ok=True)
    report = {"browser": args.engine, "viewport": "375x572", "exercises": [], "controls": {}}
    with sync_playwright() as pw:
        browser = getattr(pw, args.engine).launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 572})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        catalog = discover(page, args.base_url)
        shots = []
        for item in catalog:
            page.goto(item["url"])
            page.wait_for_function("window.__motion && window.ArticulatedFigure")
            result = page.evaluate(SAMPLE)
            assert result["articulated"], item["name"]
            assert not result["errors"], (item["name"], result)
            assert result["width"] == 375, (item["name"], result)
            assert not result["clipped"], (item["name"], result)
            assert result["pageHeight"] <= 572, (item["name"], result)
            files = []
            for i, ratio in enumerate([0, .25, .5, .75]):
                page.evaluate("t=>__motion.seek(t)", result["duration"]*ratio)
                file = args.screenshots / f"{item['name']}-{i}.png"
                page.locator("#scene").screenshot(path=str(file))
                files.append(file)
            shots.append((item["name"], files))
            report["exercises"].append({"name": item["name"], **result})
            print(f"{item['name']}: {result['samples']} samples, overflow {result['maxOverflow']:.2f}, height {result['pageHeight']}", flush=True)
        contact_sheets(shots, args.output)

        page.goto(f"{args.base_url}/lab/bench-press.html?t=0&embed=1")
        page.wait_for_function("window.__motion")
        assert page.get_by_role("button", name="재생", exact=True).count() == 1
        page.get_by_role("button", name="재생", exact=True).click()
        page.wait_for_timeout(450)
        assert page.evaluate("__motion.currentTime") > .2
        page.get_by_role("button", name="일시정지", exact=True).click()
        t = page.evaluate("__motion.currentTime")
        page.wait_for_timeout(200)
        assert page.evaluate("__motion.currentTime") == t
        page.locator("#seek").fill("1.8")
        assert abs(page.evaluate("__motion.currentTime") - 1.8) < .001
        page.get_by_role("button", name="0.5배속으로 보기", exact=True).click()
        assert page.evaluate("__motion.speed") == .5
        page.get_by_role("button", name="재생", exact=True).click()
        page.wait_for_timeout(500)
        advanced = page.evaluate("__motion.currentTime") - 1.8
        assert .12 < advanced < .4, advanced
        page.emulate_media(reduced_motion="reduce")
        page.wait_for_function("!__motion.playing")
        assert not page.evaluate("__motion.playing")
        page.reload(); page.wait_for_function("window.__motion")
        assert not page.evaluate("__motion.playing")
        page.goto(f"{args.base_url}/lab/low-bar-squat.html?embed=1")
        page.wait_for_function("window.__motion")
        assert not page.evaluate("__motion.playing")
        report["controls"] = {"play": True, "pause": True, "seek": True, "halfSpeed": True, "fixedTimeCanPlay": True, "reducedMotionInitialAndChange": True}
        assert not errors, errors
        report["consoleErrors"] = errors
        page.screenshot(path=str(args.output / "phone-controls.png"), full_page=True)
        page.goto(f"{args.base_url}/lab/heel-dig.html?t=0&embed=1")
        page.wait_for_function("window.__motion")
        mutations = page.evaluate("""async () => {
          let count=0;const observer=new MutationObserver(records=>count+=records.length);
          observer.observe(document.getElementById('cue'), {childList:true,subtree:true});
          for(let i=0;i<60;i++)__motion.seek(i/1000);
          await Promise.resolve();const sameSecond=count;
          __motion.seek(1.1);await Promise.resolve();observer.disconnect();
          return {sameSecond,changedSecond:count-sameSecond};
        }""")
        assert mutations == {"sameSecond": 0, "changedSecond": 1}, mutations
        report["controls"]["liveCueOnlyOnTextChange"] = True

        # Native SVG animations are controlled via the browser SVG API, without
        # loading the production renderer or timeline into these documents.
        manifest = ROOT / "lab/motion/manifest.json"
        if manifest.exists():
            exports = json.loads(manifest.read_text())["exercises"]
            native = browser.new_page(viewport={"width": 375, "height": 572})
            differences = []
            for item in exports:
                native.goto(f"{args.base_url}/lab/motion/{item['file']}")
                animated = native.evaluate("""() => { const s=document.documentElement;s.pauseAnimations();s.setCurrentTime(0);return {tracks:s.querySelectorAll('animate,animateTransform').length,scripts:s.querySelectorAll('script').length}}""")
                assert animated["scripts"] == 0
                assert animated["tracks"] == item["tracks"]
                source = next(row for row in catalog if row["id"] == item["id"] and row["variant"] == item["variant"])
                page.goto(source["url"]); page.wait_for_function("window.__motion")
                # Put both SVGs on an identical pixel grid. Production scenes
                # normally use a fractional svh height, irrelevant to geometry.
                page.locator("#scene").evaluate("s=>{s.style.cssText='position:fixed;left:0;top:0;width:350px;height:160px;z-index:999;background:#151515'}")
                native.evaluate("""() => {const s=document.documentElement;s.style.width='350px';s.style.height='160px';s.style.background='#151515'}""")
                item_diff = []
                for ratio in [.17, .5, .83]:
                    time = item["duration"]*ratio
                    page.evaluate("t=>__motion.seek(t)", time)
                    native.evaluate("t=>document.documentElement.setCurrentTime(t)", time)
                    actual = Image.open(io.BytesIO(page.locator("#scene").screenshot())).convert("RGB")
                    baked = Image.open(io.BytesIO(native.locator("svg").screenshot())).convert("RGB")
                    assert actual.size == baked.size, (item["file"], actual.size, baked.size)
                    difference = sum(ImageStat.Stat(ImageChops.difference(actual, baked)).mean)/3
                    assert difference < 3, (item["file"], ratio, difference)
                    item_diff.append(round(difference, 4))
                differences.append({"file": item["file"], "meanPixelDifference": item_diff})
            report["nativeExports"] = len(exports)
            report["nativeComparison"] = differences
        browser.close()
    (args.output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Verified {len(catalog)} exercise variants; report: {args.output / 'report.json'}")


if __name__ == "__main__":
    main()
