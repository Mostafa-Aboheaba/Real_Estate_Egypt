# Mobile — Property Assistant

Flutter client (iOS + Android) for the AI Property Assistant platform.

## Stack

| Package | Role |
|---------|------|
| **Riverpod** | State management |
| **go_router** | Navigation |
| **Freezed** | Immutable models |
| **Dio** | HTTP client |
| **injectable** + **get_it** | Dependency injection |
| **build_runner** | Code generation |

## Flavors

| Flavor | Entry point | API base (default) |
|--------|-------------|-------------------|
| `dev` | `lib/main_dev.dart` | `127.0.0.1` (iOS/macOS), `10.0.2.2` (Android emulator) |
| `staging` | `lib/main_staging.dart` | `https://api-staging.propertyassistant.eg/api/v1` |
| `prod` | `lib/main_prod.dart` | `https://api.propertyassistant.eg/api/v1` |

Override API URL at build time:

```bash
flutter run --flavor dev -t lib/main_dev.dart \
  --dart-define=API_BASE_URL=http://localhost:3000/api/v1
```

## Quick start

```bash
cd mobile
flutter pub get
flutter gen-l10n
dart run build_runner build --delete-conflicting-outputs
flutter run --flavor dev -t lib/main_dev.dart
```

**iOS:** Requires Xcode schemes `dev`, `staging`, `prod` (see `tool/setup_ios_flavors.py` if missing).

**Android only** (no Xcode schemes needed): same command.

**iOS without `--flavor`** (uses default Runner scheme):

```bash
flutter run -t lib/main_dev.dart
```

## Code generation

```bash
dart run build_runner build --delete-conflicting-outputs
```

Generates:

- `*.freezed.dart` — Freezed models
- `injection.config.dart` — Injectable registrations

## CI

GitHub Actions: [`.github/workflows/mobile-ci.yml`](../.github/workflows/mobile-ci.yml)

## Project structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## Architecture

[Flutter Architecture](../architecture/flutter_architecture.md)

## Milestone

Platform bootstrap (M2) — core wiring complete; feature implementation follows master execution plan.
