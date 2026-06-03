#!/usr/bin/env python3
"""Generate task markdown files from TASKS data."""

from __future__ import annotations

import pathlib

ROOT = pathlib.Path(__file__).parent

TEMPLATE = """# {id}: {title}

## Metadata

| Field | Value |
|-------|-------|
| **ID** | {id} |
| **Milestone** | {milestone} |
| **Estimate** | {estimate} |
| **Priority** | {priority} |
| **Status** | {status} |
| **Layer** | {layer} |

## Description

{description}

## Dependencies

{dependencies}

## Traces To

{traces}

## Acceptance Criteria

{acceptance}

## Affected Files

{affected}

## Test Requirements

{tests}

## Definition of Done

{dod}
"""

TASKS: list[dict] = []  # populated below in write script


def dep_list(deps: list[str], by_id: dict[str, dict] | None = None) -> str:
    if not deps:
        return "- None"
    lines: list[str] = []
    for d in deps:
        if d == "M0":
            lines.append("- M0 (architecture baseline — no task file)")
            continue
        ref = (by_id or {}).get(d)
        if ref:
            folder = ref["folder"]
            lines.append(f"- [{d}](../{folder}/{d.lower()}.md)")
        else:
            lines.append(f"- `{d}`")
    return "\n".join(lines)


def ac_list(items: list[str]) -> str:
    return "\n".join(f"- [ ] {i}" for i in items)


def files_list(items: list[str]) -> str:
    return "\n".join(f"- `{i}`" for i in items)


def write_tasks(tasks: list[dict]) -> None:
    by_id = {t["id"]: t for t in tasks}
    for t in tasks:
        folder = ROOT / t["folder"]
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / f"{t['id'].lower()}.md"
        content = TEMPLATE.format(
            id=t["id"],
            title=t["title"],
            milestone=t["milestone"],
            estimate=t["estimate"],
            priority=t["priority"],
            status=t.get("status", "pending"),
            layer=t["layer"],
            description=t["description"],
            dependencies=dep_list(t.get("deps", []), by_id),
            traces=t.get("traces", "—"),
            acceptance=ac_list(t["acceptance"]),
            affected=files_list(t["files"]),
            tests=t.get("tests", "—"),
            dod=ac_list(t.get("dod", t["acceptance"])),
        )
        path.write_text(content)


if __name__ == "__main__":
    from tasks_data import TASKS as DATA  # noqa: PLC0415

    write_tasks(DATA)
    print(f"Generated {len(DATA)} task files")
