#!/usr/bin/env python3
"""Mark a task done and refresh PROJECT_STATUS.md.

Usage:
  python3 tasks/complete_task.py M5-PRO001
  python3 tasks/complete_task.py m5-pro001 in_progress
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

TASKS_ROOT = Path(__file__).resolve().parent
STATUS_RE = re.compile(
    r"(\|\s*\*\*Status\*\*\s*\|\s*)(pending|done|in_progress|blocked)(\s*\|)",
    re.IGNORECASE,
)


def find_task_file(task_id: str) -> Path | None:
    needle = task_id.lower().replace("_", "-")
    for folder in TASKS_ROOT.iterdir():
        if not folder.is_dir() or folder.name.startswith("."):
            continue
        candidate = folder / f"{needle}.md"
        if candidate.exists():
            return candidate
    return None


def set_status(path: Path, status: str) -> None:
    text = path.read_text(encoding="utf-8")
    if not STATUS_RE.search(text):
        raise SystemExit(f"No Status row in {path}")
    new_text, n = STATUS_RE.subn(
        rf"\g<1>{status}\g<3>", text, count=1
    )
    if n != 1:
        raise SystemExit(f"Failed to update status in {path}")
    path.write_text(new_text, encoding="utf-8")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: complete_task.py <TASK-ID> [status]")

    task_id = sys.argv[1].upper()
    status = (sys.argv[2] if len(sys.argv) > 2 else "done").lower()
    if status not in ("pending", "done", "in_progress", "blocked"):
        raise SystemExit(f"Invalid status: {status}")

    path = find_task_file(task_id)
    if not path:
        raise SystemExit(f"Task file not found for {task_id}")

    set_status(path, status)
    print(f"Updated {path.name} → {status}")

    subprocess.run(
        [sys.executable, str(TASKS_ROOT / "build_project_status.py")],
        check=True,
    )


if __name__ == "__main__":
    main()
