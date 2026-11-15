"""Discover production exercise pages and their variants from the running app."""
from pathlib import Path
from urllib.parse import urlencode
import re

ROOT = Path(__file__).resolve().parents[1]


def discover(page, base_url):
    catalog = []
    for path in sorted((ROOT / "lab").glob("*.html")):
        if not re.search(r'src="ex/[^"?]+\.js', path.read_text()):
            continue
        page.goto(f"{base_url}/lab/{path.name}?t=0")
        page.wait_for_function("window.__demoConfig && window.__motion")
        variants = page.evaluate("Object.keys(__demoConfig.variants || {})")
        for variant in [None, *variants]:
            name = path.stem + (f"--{variant}" if variant else "")
            params = {"t": "0", "embed": "1"}
            if variant:
                params["variant"] = variant
            catalog.append({"id": path.stem, "variant": variant, "name": name,
                            "url": f"{base_url}/lab/{path.name}?{urlencode(params)}"})
    return catalog
