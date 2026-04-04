#!/usr/bin/env python3
"""
Scrapes https://en.wikipedia.org/wiki/List_of_national_flags_of_sovereign_states
and downloads every flag SVG + writes flags.json with {name, ratio, file}.

Output:
  scripts/flags/          — downloaded SVG images
  scripts/flags.json      — [{name, ratio, file}, ...]
"""

import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

WIKI_URL = "https://en.wikipedia.org/wiki/List_of_national_flags_of_sovereign_states"
OUT_DIR = Path(__file__).parent / "flags"
JSON_OUT = Path(__file__).parent / "flags.json"
DELAY = 20  # seconds between image downloads

HEADERS = {
    "User-Agent": "flag-draws-scraper/1.0 (educational project; python-requests)"
}


def sanitize_filename(name: str) -> str:
    """Turn a country name into a safe filename."""
    name = re.sub(r"[^\w\s\-]", "", name)
    name = re.sub(r"\s+", "_", name.strip())
    return name.lower()


def svg_url_from_thumb(src: str) -> str | None:
    """
    Convert a Wikipedia thumbnail URL to its original SVG URL.

    Thumbnail:  //upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Flag_of_X.svg/250px-Flag_of_X.svg.png
    SVG:        https://upload.wikimedia.org/wikipedia/commons/a/ab/Flag_of_X.svg

    Only returns a URL if the source file is an SVG; returns None otherwise.
    """
    src = src.lstrip("/")
    # Must be a thumb of an SVG
    m = re.match(
        r"upload\.wikimedia\.org/wikipedia/commons/thumb/([^/]+/[^/]+/[^/]+\.svg)/",
        src,
    )
    if not m:
        return None
    return "https://upload.wikimedia.org/wikipedia/commons/" + m.group(1)


def parse_ratio(text: str) -> str | None:
    """Extract a ratio like '2:3' or '28:37' from cell text."""
    m = re.search(r"\d+\s*:\s*\d+", text)
    return m.group(0).replace(" ", "") if m else None


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Fetching {WIKI_URL} …")
    resp = requests.get(WIKI_URL, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # The flags table is the first wikitable sortable on the page
    table = soup.find("table", class_=re.compile(r"wikitable"))
    if not table:
        raise RuntimeError("Could not find the flags table on the page.")

    rows = table.find_all("tr")
    records = []

    for row in rows:
        cells = row.find_all(["td", "th"])
        if len(cells) < 3:
            continue

        # ── Flag image ────────────────────────────────────────────────────────
        img_tag = cells[0].find("img")
        if not img_tag:
            continue
        img_src = svg_url_from_thumb(img_tag.get("src", ""))
        if not img_src:
            continue

        # ── Country name ──────────────────────────────────────────────────────
        # First <a> in the second cell that isn't a footnote
        name_cell = cells[1]
        name_link = name_cell.find("a", href=re.compile(r"^/wiki/(?!File:|Help:)"))
        if name_link:
            name = name_link.get_text(strip=True)
        else:
            name = name_cell.get_text(" ", strip=True).split("[")[0].strip()
        if not name:
            continue

        # ── Ratio ─────────────────────────────────────────────────────────────
        ratio_text = cells[2].get_text(" ", strip=True)
        ratio = parse_ratio(ratio_text)
        if not ratio:
            continue

        records.append({"name": name, "ratio": ratio, "img_src": img_src})

    print(f"Found {len(records)} entries.")

    # ── Download images ───────────────────────────────────────────────────────
    results = []
    for i, rec in enumerate(records, 1):
        safe = sanitize_filename(rec["name"])
        filename = f"{safe}.svg"
        dest = OUT_DIR / filename

        if dest.exists():
            print(f"  [{i}/{len(records)}] {rec['name']} — already downloaded, skipping")
        else:
            try:
                img_resp = requests.get(rec["img_src"], headers=HEADERS, timeout=20)
                img_resp.raise_for_status()
                dest.write_bytes(img_resp.content)
                print(f"  [{i}/{len(records)}] {rec['name']} ({rec['ratio']}) → {filename}")
            except Exception as e:
                print(f"  [{i}/{len(records)}] {rec['name']} — FAILED: {e}")
                filename = None
            time.sleep(DELAY)

        results.append({
            "name": rec["name"],
            "ratio": rec["ratio"],
            "file": filename,
        })

    # ── Write JSON ────────────────────────────────────────────────────────────
    JSON_OUT.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\nDone. {len(results)} entries written to {JSON_OUT}")
    print(f"Images saved in {OUT_DIR}/")


if __name__ == "__main__":
    main()
