#!/usr/bin/env python3
"""Add iOS flavor build configurations and Xcode schemes to Runner.xcodeproj."""

from __future__ import annotations

import pathlib
import re
import uuid

ROOT = pathlib.Path(__file__).resolve().parent.parent
PBXPROJ = ROOT / "ios/Runner.xcodeproj/project.pbxproj"
SCHEMES_DIR = ROOT / "ios/Runner.xcodeproj/xcshareddata/xcschemes"

FLAVORS = ("dev", "staging", "prod")
CONFIG_TYPES = ("Debug", "Release", "Profile")

SRC = {
    "project": {
        "Debug": "97C147031CF9000F007C117D",
        "Release": "97C147041CF9000F007C117D",
        "Profile": "249021D3217E4FDB00AE95B9",
    },
    "runner": {
        "Debug": "97C147061CF9000F007C117D",
        "Release": "97C147071CF9000F007C117D",
        "Profile": "249021D4217E4FDB00AE95B9",
    },
}


def uid() -> str:
    return uuid.uuid4().hex[:24].upper()


def extract_block(text: str, block_id: str) -> str:
    pattern = rf"\t\t{block_id} /\* [^*]+ \*/ = \{{.*?\n\t\t\}};"
    match = re.search(pattern, text, re.DOTALL)
    if not match:
        raise RuntimeError(f"Block not found: {block_id}")
    return match.group(0)


def set_block_name(block: str, name: str) -> str:
    if re.search(r"\n\t\t\tname = ", block):
        return re.sub(r"\n\t\t\tname = [^;]+;", f'\n\t\t\tname = "{name}";', block, count=1)
    return block.replace(
        "buildSettings = {",
        f'name = "{name}";\n\t\t\tbuildSettings = {{',
        1,
    )


def main() -> None:
    text = PBXPROJ.read_text()
    if "Debug-dev" in text and "6FD45867" not in text:
        print("iOS flavors already configured.")
        _write_schemes()
        return

    file_refs: dict[str, str] = {}
    file_ref_lines = []
    for flavor in FLAVORS:
        for ctype in CONFIG_TYPES:
            name = f"{ctype}-{flavor}"
            fid = uid()
            file_refs[name] = fid
            file_ref_lines.append(
                f"\t\t{fid} /* {name}.xcconfig */ = {{isa = PBXFileReference; "
                f'lastKnownFileType = text.xcconfig; name = "{name}.xcconfig"; '
                f"path = Flutter/{name}.xcconfig; sourceTree = \"<group>\"; }};"
            )

    text = text.replace(
        "/* End PBXFileReference section */",
        "\n".join(file_ref_lines) + "\n/* End PBXFileReference section */",
    )

    flutter_children = "\n".join(
        f"\t\t\t\t{file_refs[f'{ctype}-{flavor}']} /* {ctype}-{flavor}.xcconfig */,"
        for flavor in FLAVORS
        for ctype in CONFIG_TYPES
    )
    text = text.replace(
        "9740EEB31CF90195004384FC /* Generated.xcconfig */,",
        "9740EEB31CF90195004384FC /* Generated.xcconfig */,\n" + flutter_children,
    )

    new_configs = []
    project_config_ids: list[str] = []
    runner_config_ids: list[str] = []

    for flavor in FLAVORS:
        for ctype in CONFIG_TYPES:
            name = f"{ctype}-{flavor}"
            proj_id = uid()
            runner_id = uid()
            project_config_ids.append(proj_id)
            runner_config_ids.append(runner_id)

            proj_block = extract_block(text, SRC["project"][ctype])
            proj_block = proj_block.replace(SRC["project"][ctype], proj_id, 1)
            proj_block = proj_block.replace(f"/* {ctype} */", f"/* {name} */", 1)
            proj_block = set_block_name(proj_block, name)
            new_configs.append(proj_block)

            runner_block = extract_block(text, SRC["runner"][ctype])
            runner_block = runner_block.replace(SRC["runner"][ctype], runner_id, 1)
            runner_block = runner_block.replace(f"/* {ctype} */", f"/* {name} */", 1)
            runner_block = set_block_name(runner_block, name)
            xc_ref = file_refs[name]
            if "baseConfigurationReference" in runner_block:
                runner_block = re.sub(
                    r"baseConfigurationReference = [^;]+;",
                    f"baseConfigurationReference = {xc_ref} /* {name}.xcconfig */;",
                    runner_block,
                    count=1,
                )
            else:
                runner_block = runner_block.replace(
                    "isa = XCBuildConfiguration;",
                    f"isa = XCBuildConfiguration;\n\t\t\tbaseConfigurationReference = "
                    f"{xc_ref} /* {name}.xcconfig */;",
                    1,
                )
            new_configs.append(runner_block)

    text = text.replace(
        "/* End XCBuildConfiguration section */",
        "\n".join(new_configs) + "\n/* End XCBuildConfiguration section */",
    )

    project_insert = "\n".join(
        f"\t\t\t\t{project_config_ids[i]} /* {CONFIG_TYPES[i % 3]}-{FLAVORS[i // 3]} */,"
        for i in range(len(project_config_ids))
    )
    text = text.replace(
        "\t\t\t\t249021D3217E4FDB00AE95B9 /* Profile */,\n\t\t\t);",
        "\t\t\t\t249021D3217E4FDB00AE95B9 /* Profile */,\n"
        + project_insert
        + "\n\t\t\t);",
        1,
    )

    runner_insert = "\n".join(
        f"\t\t\t\t{runner_config_ids[i]} /* {CONFIG_TYPES[i % 3]}-{FLAVORS[i // 3]} */,"
        for i in range(len(runner_config_ids))
    )
    text = text.replace(
        "\t\t\t\t249021D4217E4FDB00AE95B9 /* Profile */,\n\t\t\t);",
        "\t\t\t\t249021D4217E4FDB00AE95B9 /* Profile */,\n"
        + runner_insert
        + "\n\t\t\t);",
        1,
    )

    PBXPROJ.write_text(text)
    _write_schemes()
    print("iOS flavors configured: dev, staging, prod")


def _write_schemes() -> None:
    runner_scheme = (SCHEMES_DIR / "Runner.xcscheme").read_text()
    for flavor in FLAVORS:
        scheme = runner_scheme
        scheme = scheme.replace(
            "<LaunchAction\n      buildConfiguration = \"Debug\"",
            f"<LaunchAction\n      buildConfiguration = \"Debug-{flavor}\"",
        )
        scheme = scheme.replace(
            "<TestAction\n      buildConfiguration = \"Debug\"",
            f"<TestAction\n      buildConfiguration = \"Debug-{flavor}\"",
        )
        scheme = scheme.replace(
            "<ProfileAction\n      buildConfiguration = \"Profile\"",
            f"<ProfileAction\n      buildConfiguration = \"Profile-{flavor}\"",
        )
        scheme = scheme.replace(
            "<AnalyzeAction\n      buildConfiguration = \"Debug\"",
            f"<AnalyzeAction\n      buildConfiguration = \"Debug-{flavor}\"",
        )
        scheme = scheme.replace(
            "<ArchiveAction\n      buildConfiguration = \"Release\"",
            f"<ArchiveAction\n      buildConfiguration = \"Release-{flavor}\"",
        )
        (SCHEMES_DIR / f"{flavor}.xcscheme").write_text(scheme)


if __name__ == "__main__":
    main()
