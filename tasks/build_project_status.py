#!/usr/bin/env python3
"""Generate PROJECT_STATUS.md from task registry files + dashboard_config.yaml.

Run after marking any task done:
  python3 tasks/build_project_status.py

Or from repo root:
  python3 tasks/build_project_status.py
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TASKS_ROOT = Path(__file__).resolve().parent
OUTPUT = REPO_ROOT / "PROJECT_STATUS.md"
CONFIG = TASKS_ROOT / "dashboard_config.json"

TASK_FOLDERS = [
    "m01-sdd",
    "m02-platform",
    "m03-authentication",
    "m04-property-search",
    "m05-profile",
    "m06-rag",
    "m07-ai-chat",
    "m08-recommendations",
    "m09-booking",
    "m10-quality",
    "m11-staging-gcp",
    "m12-production",
]

FOLDER_TO_MILESTONE = {
    "m01-sdd": "M1",
    "m02-platform": "M2",
    "m03-authentication": "M3",
    "m04-property-search": "M4",
    "m05-profile": "M5",
    "m06-rag": "M6",
    "m07-ai-chat": "M7",
    "m08-recommendations": "M8",
    "m09-booking": "M9",
    "m10-quality": "M10",
    "m11-staging-gcp": "M11",
    "m12-production": "M12",
}

STATUS_RE = re.compile(
    r"\|\s*\*\*Status\*\*\s*\|\s*(pending|done|in_progress|blocked)\s*\|",
    re.IGNORECASE,
)
ID_RE = re.compile(r"\|\s*\*\*ID\*\*\s*\|\s*([A-Z0-9-]+)\s*\|")
TITLE_RE = re.compile(r"^#\s+([A-Z0-9-]+):\s*(.+)$", re.MULTILINE)


@dataclass
class TaskRow:
    id: str
    title: str
    status: str
    folder: str
    path: str

    @property
    def milestone_id(self) -> str:
        return FOLDER_TO_MILESTONE.get(self.folder, "?")


@dataclass
class MilestoneStats:
    id: str
    name: str
    done: int = 0
    pending: int = 0
    in_progress: int = 0
    blocked: int = 0
    total: int = 0
    notes: str = ""
    process_blocker: bool = False
    type: str = "implementation"

    @property
    def pct(self) -> float:
        return (100.0 * self.done / self.total) if self.total else 0.0

    @property
    def state(self) -> str:
        if self.total == 0:
            return "—"
        if self.done == self.total:
            return "Complete"
        if self.in_progress > 0:
            return "In progress"
        if self.process_blocker and self.done == 0:
            return "Blocked (process)"
        if self.done > 0:
            return "Partial"
        return "Not started"


def load_config() -> dict:
    if not CONFIG.exists():
        return {}
    with CONFIG.open(encoding="utf-8") as f:
        return json.load(f)


def pick_next_task(
    tasks: list[TaskRow], current: str, config: dict
) -> dict:
    pending = sorted(
        (t for t in tasks if t.status == "pending" and t.milestone_id == current),
        key=lambda x: x.id,
    )
    if pending:
        t = pending[0]
        return {
            "id": t.id,
            "name": t.title,
            "path": t.path,
            "reason": f"First pending task in {current}.",
        }
    return config.get("next_task", {})


def scan_tasks() -> list[TaskRow]:
    rows: list[TaskRow] = []
    for folder in TASK_FOLDERS:
        dir_path = TASKS_ROOT / folder
        if not dir_path.is_dir():
            continue
        for path in sorted(dir_path.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            status_m = STATUS_RE.search(text)
            if not status_m:
                continue
            status = status_m.group(1).lower()
            id_m = ID_RE.search(text)
            title_m = TITLE_RE.search(text)
            task_id = id_m.group(1) if id_m else path.stem.upper()
            title = title_m.group(2).strip() if title_m else path.stem
            rows.append(
                TaskRow(
                    id=task_id,
                    title=title,
                    status=status,
                    folder=folder,
                    path=str(path.relative_to(REPO_ROOT)),
                )
            )
    return rows


def aggregate(
    tasks: list[TaskRow], config: dict
) -> dict[str, MilestoneStats]:
    meta = config.get("milestones", {})
    stats: dict[str, MilestoneStats] = {}
    for folder, mid in FOLDER_TO_MILESTONE.items():
        m = meta.get(mid, {})
        stats[mid] = MilestoneStats(
            id=mid,
            name=m.get("name", mid),
            notes=m.get("notes", ""),
            process_blocker=bool(m.get("process_blocker")),
            type=m.get("type", "implementation"),
        )
    for t in tasks:
        s = stats[t.milestone_id]
        s.total += 1
        if t.status == "done":
            s.done += 1
        elif t.status == "in_progress":
            s.in_progress += 1
        elif t.status == "blocked":
            s.blocked += 1
        else:
            s.pending += 1
    return stats


def pick_current_milestone(
    stats: dict[str, MilestoneStats], order: list[str]
) -> str:
    """First milestone in order that is not fully complete (implementation focus)."""
    for mid in order:
        s = stats.get(mid)
        if not s or s.total == 0:
            continue
        if s.done < s.total:
            # M1 with only process blocker: skip to next impl milestone if M2+ done
            if mid == "M1" and s.done == 0:
                continue
            return mid
    return order[-1] if order else "M5"


def implementation_slice_summary(
    stats: dict[str, MilestoneStats], order: list[str]
) -> str:
    """Highest contiguous M2+ implementation milestones that are fully done."""
    complete: list[str] = []
    for mid in order:
        if mid in ("M0", "M1"):
            continue
        s = stats.get(mid)
        if not s or s.total == 0:
            continue
        if s.done < s.total:
            break
        complete.append(mid)
    if not complete:
        return "Not started (M2+)"
    task_count = sum(stats[mid].done for mid in complete)
    if len(complete) == 1:
        label = complete[0]
    else:
        label = f"{complete[0]}–{complete[-1]}"
    return f"{label} complete ({task_count} tasks)"


def signoff_pending(config: dict) -> bool:
    path = REPO_ROOT / config.get("sdd", {}).get(
        "signoff_file", "tasks/m1_approval_signoff.md"
    )
    if not path.exists():
        return True
    text = path.read_text(encoding="utf-8")
    return "Pending" in text and "Approved to implement M2+" not in text.split(
        "Gate decision"
    )[-1]


def render(
    tasks: list[TaskRow],
    stats: dict[str, MilestoneStats],
    config: dict,
) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    total = len(tasks)
    done = sum(1 for t in tasks if t.status == "done")
    pending = sum(1 for t in tasks if t.status == "pending")
    in_prog = sum(1 for t in tasks if t.status == "in_progress")
    blocked = sum(1 for t in tasks if t.status == "blocked")
    pct = (100.0 * done / total) if total else 0.0

    order = config.get("milestone_order", list(FOLDER_TO_MILESTONE.values()))
    current = pick_current_milestone(stats, order)
    current_stat = stats.get(current)
    current_name = current_stat.name if current_stat else current

    completed_ms: list[str] = ["M0 — Architecture & Product Foundation"]
    for mid in order:
        s = stats.get(mid)
        if not s or s.total == 0:
            continue
        if s.done == s.total:
            completed_ms.append(f"{mid} — {s.name}")
    # M1 special: artifacts without task registry
    sdd = config.get("sdd", {})
    m1 = stats.get("M1")
    if m1 and m1.done < m1.total and sdd.get("artifact_count", 0) >= sdd.get(
        "artifact_target", 48
    ):
        if "M1 —" not in " ".join(completed_ms):
            pass  # not completed until tasks/sign-off

    remaining_ms = []
    for mid in order:
        s = stats.get(mid)
        if not s or s.total == 0:
            continue
        if s.done < s.total:
            remaining_ms.append(f"{mid} — {s.name} ({s.done}/{s.total} tasks)")

    done_tasks = sorted(
        [t for t in tasks if t.status == "done"], key=lambda x: x.id
    )
    order_rank = {m: i for i, m in enumerate(order)}
    pending_tasks = sorted(
        [t for t in tasks if t.status == "pending"],
        key=lambda x: (order_rank.get(x.milestone_id, 99), x.id),
    )
    in_progress_tasks = [t for t in tasks if t.status == "in_progress"]
    blocked_tasks = [t for t in tasks if t.status == "blocked"]

    process_blocked: list[str] = []
    if signoff_pending(config):
        process_blocked.append(
            "M1 approval gate — `tasks/m1_approval_signoff.md` (PO / Tech / QA)"
        )
    if m1 and m1.process_blocker and m1.pending == m1.total:
        process_blocked.append(
            f"M1 task registry — {m1.pending}/{m1.total} SDD tasks still `pending` "
            "(artifacts exist under `features/`)"
        )

    next_task = pick_next_task(tasks, current, config)
    risks = config.get("risks", [])
    debt = config.get("technical_debt", [])

    lines = [
        "# Project Status Dashboard",
        "",
        "> **Auto-generated** — do not edit by hand. Regenerate after completing a task:",
        "> `python3 tasks/build_project_status.py`",
        "",
        f"**Last updated:** {now}  ",
        f"**Source:** {total} tasks under `tasks/m*/` + [`tasks/dashboard_config.json`](tasks/dashboard_config.json)",
        "",
        "---",
        "",
        "## Executive summary",
        "",
        "| Metric | Value |",
        "|--------|-------|",
        f"| **Overall completion** | **{pct:.1f}%** ({done} / {total} tasks) |",
        f"| **Current milestone** | **{current}** — {current_name} |",
        f"| **Task breakdown** | Done {done} · Pending {pending} · In progress {in_prog} · Blocked {blocked} |",
        f"| **Implementation slice** | {implementation_slice_summary(stats, order)} |",
        "",
        "---",
        "",
        "## Milestones",
        "",
        "| ID | Milestone | Tasks | Progress | State |",
        "|----|-----------|-------|----------|-------|",
    ]

    lines.append("| M0 | Architecture & Product Foundation | — | 100% | Complete |")
    for mid in order:
        s = stats[mid]
        if s.total == 0:
            continue
        bar = f"{s.done}/{s.total} ({s.pct:.0f}%)"
        note = f" — {s.notes}" if s.notes and s.done < s.total else ""
        lines.append(
            f"| {mid} | {s.name} | {bar} | {s.pct:.0f}% | {s.state}{note} |"
        )

    lines.extend(
        [
            "",
            "### Completed milestones",
            "",
        ]
    )
    for item in completed_ms:
        lines.append(f"- {item}")
    if m1 and m1.done < m1.total and sdd:
        lines.append(
            f"- M1 SDD artifacts: **{sdd.get('artifact_count', '?')}/{sdd.get('artifact_target', 48)}** "
            "(content); registry/sign-off incomplete"
        )

    lines.extend(["", "### Current milestone", "", f"**{current} — {current_name}**", ""])
    nt = next_task
    if nt:
        path = nt.get("path", "")
        link = f"[{nt.get('id', '?')}]({path})" if path else nt.get("id", "?")
        lines.append(f"**Next recommended task:** {link} — {nt.get('name', '')}  ")
        if nt.get("reason"):
            lines.append(f"  \n*{nt.get('reason')}*")

    lines.extend(["", "### Remaining milestones", ""])
    for item in remaining_ms:
        lines.append(f"- {item}")

    lines.extend(["", "---", "", "## Tasks", "", "### Completed", ""])
    by_m: dict[str, list[TaskRow]] = {}
    for t in done_tasks:
        by_m.setdefault(t.milestone_id, []).append(t)
    for mid in order:
        group = by_m.get(mid, [])
        if not group:
            continue
        ids = ", ".join(t.id for t in group)
        lines.append(f"- **{mid}** ({len(group)}): {ids}")

    preview: list[TaskRow] = []
    for mid in order:
        if mid == "M1":
            continue
        preview.extend(t for t in pending_tasks if t.milestone_id == mid)
        if len(preview) >= 15:
            break
    preview = preview[:15]
    lines.extend(
        [
            "",
            f"### Pending — implementation path (next {len(preview)})",
            "",
        ]
    )
    for t in preview:
        lines.append(f"- [{t.id}]({t.path}) — {t.title}")
    impl_pending = sum(1 for t in pending_tasks if t.milestone_id != "M1")
    if impl_pending > len(preview):
        lines.append(f"- *…and {impl_pending - len(preview)} more (excl. M1 registry)*")
    m1_pending = sum(1 for t in pending_tasks if t.milestone_id == "M1")
    if m1_pending:
        lines.append(f"- *M1 SDD registry: {m1_pending} tasks still `pending`*")

    lines.extend(["", "### In progress", ""])
    if in_progress_tasks:
        for t in in_progress_tasks:
            lines.append(f"- [{t.id}]({t.path}) — {t.title}")
    else:
        lines.append("- *None*")

    lines.extend(["", "### Blocked (registry)", ""])
    if blocked_tasks:
        for t in blocked_tasks:
            lines.append(f"- [{t.id}]({t.path}) — {t.title}")
    else:
        lines.append("- *None marked `blocked` in task files*")

    lines.extend(["", "### Blocked (process / external)", ""])
    if process_blocked:
        for b in process_blocked:
            lines.append(f"- {b}")
    else:
        lines.append("- *None*")

    lines.extend(["", "---", "", "## Risks", ""])
    for r in risks:
        sev = r.get("severity", "?").upper()
        lines.append(f"- **[{sev}] {r.get('title', '?')}** — {r.get('impact', '')}")

    lines.extend(["", "---", "", "## Technical debt", ""])
    for section in debt:
        src = section.get("source", "general")
        lines.append(f"### {src}")
        for item in section.get("items", []):
            lines.append(f"- {item}")
        lines.append("")

    lines.extend(
        [
            "---",
            "",
            "## Reports",
            "",
            "| Milestone | Report |",
            "|-----------|--------|",
            "| M1 | [SDD completion gate](tasks/m1_sdd_completion_report.md) · [Sign-off](tasks/m1_approval_signoff.md) |",
            "| M2 | [Platform bootstrap](tasks/m02_platform_bootstrap_completion_report.md) |",
            "| M3 | [Authentication](tasks/m03_authentication_completion_report.md) · [Review](tasks/m03_authentication_implementation_review.md) |",
            "| M4 | [Property search](tasks/m04_property_search_completion_report.md) · [Review](tasks/m04_property_search_implementation_review.md) |",
            "| M5 | [Profile](tasks/m05_profile_completion_report.md) |",
            "| M6 | [RAG & embeddings](tasks/m06_rag_completion_report.md) |",
            "| M7 | [AI Chat](tasks/m07_chat_completion_report.md) |",
            "",
            "---",
            "",
            "## Maintenance",
            "",
            "1. Mark done: `python3 tasks/complete_task.py M7-CHT001`",
            "   (or set `**Status**` to `done` in the task file, then step 2).",
            "2. Run `python3 tasks/build_project_status.py`.",
            "3. Commit the task file and `PROJECT_STATUS.md` together.",
            "",
            "Optional: update `tasks/dashboard_config.json` for risks and technical debt.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    config = load_config()
    tasks = scan_tasks()
    stats = aggregate(tasks, config)
    OUTPUT.write_text(render(tasks, stats, config), encoding="utf-8")
    total = len(tasks)
    done = sum(1 for t in tasks if t.status == "done")
    print(f"Wrote {OUTPUT.relative_to(REPO_ROOT)} — {done}/{total} tasks done")


if __name__ == "__main__":
    main()
