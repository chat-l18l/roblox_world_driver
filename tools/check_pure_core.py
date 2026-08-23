#!/usr/bin/env python3
"""Bewaakt de harde regel uit AGENTS.md: src/shared/core/ raakt geen Roblox-API aan.

Waarom dit script bestaat: die regel is wat de unit-tests headless onder Lune laat
draaien, in milliseconden, zonder Roblox. Zodra er een Vector3 of een task.wait in
de kern sluipt, is die eigenschap weg en merkt niemand het tot de CI traag wordt.

Aanpak: commentaar en stringliterals eruit strippen, daarna op hele woorden zoeken.
Zonder die stap slaat de checker aan op het woord "game" in een Nederlandse zin.

Exit 0 = schoon, exit 1 = overtreding gevonden.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

CORE = Path(__file__).resolve().parent.parent / "src" / "shared" / "core"

# Roblox-globals en datatypes die de kern onbruikbaar maken buiten de engine.
FORBIDDEN = [
    "game",
    "workspace",
    "script",
    "Instance",
    "Enum",
    "task",
    "wait",
    "spawn",
    "delay",
    "Vector2",
    "Vector3",
    "CFrame",
    "Color3",
    "UDim",
    "UDim2",
    "Ray",
    "Region3",
    "TweenInfo",
    "RemoteEvent",
    "RemoteFunction",
    "DataStoreService",
    "HttpService",
    "RunService",
    "Players",
    "ReplicatedStorage",
]

BLOCK_COMMENT = re.compile(r"--\[(=*)\[.*?\]\1\]", re.DOTALL)
LINE_COMMENT = re.compile(r"--[^\n]*")
LONG_STRING = re.compile(r"\[(=*)\[.*?\]\1\]", re.DOTALL)
QUOTED = re.compile(r"(\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)")


def strip_noise(source: str) -> str:
    """Vervangt commentaar en strings door spaties, met behoud van regelnummers."""

    def blank(match: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))

    source = BLOCK_COMMENT.sub(blank, source)
    source = LONG_STRING.sub(blank, source)
    source = QUOTED.sub(blank, source)
    source = LINE_COMMENT.sub(blank, source)
    return source


def check(path: Path) -> list[tuple[int, str, str]]:
    """Geeft (regelnummer, verboden woord, regeltekst) voor elke overtreding."""
    original = path.read_text(encoding="utf-8").splitlines()
    cleaned = strip_noise(path.read_text(encoding="utf-8")).splitlines()

    hits: list[tuple[int, str, str]] = []
    for number, line in enumerate(cleaned, start=1):
        for word in FORBIDDEN:
            if re.search(rf"\b{re.escape(word)}\b", line):
                hits.append((number, word, original[number - 1].strip()))
    return hits


def main() -> int:
    if not CORE.is_dir():
        print(f"check_pure_core: {CORE} bestaat niet", file=sys.stderr)
        return 1

    files = sorted(CORE.rglob("*.luau"))
    if not files:
        print(f"check_pure_core: geen .luau gevonden in {CORE}", file=sys.stderr)
        return 1

    total = 0
    for path in files:
        for number, word, text in check(path):
            rel = path.relative_to(CORE.parent.parent.parent)
            print(f"{rel}:{number}: Roblox-API '{word}' in pure kern -> {text}")
            total += 1

    if total:
        print(
            f"\ncheck_pure_core: {total} overtreding(en). "
            "src/shared/core/ moet headless draaien; verplaats dit naar "
            "src/server/ of src/client/.",
            file=sys.stderr,
        )
        return 1

    print(f"check_pure_core: {len(files)} bestand(en) schoon")
    return 0


if __name__ == "__main__":
    sys.exit(main())
