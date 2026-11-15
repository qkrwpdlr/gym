"""Bake all production exercise rigs into standalone native animated SVG files.

Run with a local server, e.g. python3 -m http.server 8017, then:
  python scripts/export-exercise-svg.py --base-url http://localhost:8017
Requires Python Playwright and its Chromium browser. No upstream paths copied.
"""
import argparse
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
from exercise_motion_catalog import ROOT, discover


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://localhost:8017")
    parser.add_argument("--output", type=Path, default=ROOT / "lab/motion")
    parser.add_argument("--fps", type=int, default=20)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    manifest = {"format": "articulated-svg-smil-v1", "fps": args.fps,
                "visualReference": "https://bryllim.github.io/workout-guide/exercises/",
                "geometry": "Original joint-local contours; no upstream paths copied",
                "exercises": []}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 572})
        for item in discover(page, args.base_url):
            page.goto(item["url"])
            page.wait_for_function("window.__motion && window.ArticulatedFigure")
            page.add_script_tag(url=f"{args.base_url}/lab/svg-motion-export.js")
            svg = page.evaluate("fps => SvgMotion.exportSvg(__motion, document.getElementById('scene'), {fps})", args.fps)
            root = ET.fromstring(svg)
            assert not any(n.tag.endswith("script") or "href" in n.attrib for n in root.iter())
            output = args.output / f"{item['name']}.svg"
            output.write_text(svg + "\n")
            manifest["exercises"].append({"id": item["id"], "variant": item["variant"],
                "file": output.name, "title": page.evaluate("__demoConfig.meta.title"),
                "duration": page.evaluate("__motion.duration"), "bytes": output.stat().st_size,
                "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
                "tracks": sum(n.tag.endswith("animate") or n.tag.endswith("animateTransform") for n in root.iter())})
            print(f"{output.name}: {output.stat().st_size:,} bytes", flush=True)
        browser.close()
    (args.output / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"Exported {len(manifest['exercises'])} SVGs to {args.output}")


if __name__ == "__main__":
    main()
