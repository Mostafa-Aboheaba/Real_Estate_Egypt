# Flutter Project Structure

> Feature-first Clean Architecture. **Folder structure only** — no implementation until specs approved.

## Stack

| Package | Role |
|---------|------|
| **Riverpod** | State management |
| **go_router** | Navigation |
| **Freezed** | Immutable models / unions |
| **Dio** | HTTP client |
| **injectable** + **get_it** | Dependency injection |
| **build_runner** | Code generation (Freezed, Injectable, JSON) |

---

## Root

```
mobile/
├── android/
├── ios/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── l10n/
│   ├── app_en.arb
│   └── app_ar.arb
├── lib/
├── test/
├── integration_test/
├── pubspec.yaml
├── analysis_options.yaml
├── build.yaml
└── README.md
```

---

## `lib/` — Application

```
lib/
├── main.dart
├── app.dart
├── bootstrap.dart
│
├── core/
│   ├── config/
│   │   ├── env.dart
│   │   └── app_config.dart
│   │
│   ├── di/
│   │   ├── injection.dart
│   │   ├── injection.config.dart          # generated — injectable
│   │   └── register_module.dart
│   │
│   ├── network/
│   │   ├── api_client.dart
│   │   ├── dio_factory.dart
│   │   ├── auth_interceptor.dart
│   │   ├── logging_interceptor.dart
│   │   └── network_info.dart
│   │
│   ├── routing/
│   │   ├── app_router.dart
│   │   ├── route_paths.dart
│   │   └── route_guards.dart
│   │
│   ├── error/
│   │   ├── exceptions.dart
│   │   ├── failures.dart
│   │   └── failure_mapper.dart
│   │
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   └── app_typography.dart
│   │
│   ├── constants/
│   │   ├── api_constants.dart
│   │   └── app_constants.dart
│   │
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── extensions/
│   │       ├── string_extensions.dart
│   │       └── context_extensions.dart
│   │
│   ├── widgets/
│   │   ├── app_scaffold.dart
│   │   ├── loading_indicator.dart
│   │   ├── error_view.dart
│   │   └── empty_state.dart
│   │
│   └── providers/
│       ├── app_providers.dart
│       ├── locale_provider.dart
│       └── connectivity_provider.dart
│
└── features/
    ├── authentication/
    ├── property_search/
    ├── ai_chat/
    ├── recommendation/
    ├── booking/
    ├── profile/
    └── home/
```

---

## Feature template (each feature follows this layout)

```
features/<feature_name>/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
│
├── data/
│   ├── models/
│   ├── datasources/
│   │   ├── remote/
│   │   └── local/
│   └── repositories/
│
└── presentation/
    ├── pages/
    ├── widgets/
    └── providers/
```

---

## `features/authentication/`

```
features/authentication/
├── domain/
│   ├── entities/
│   │   └── user.dart
│   ├── repositories/
│   │   └── auth_repository.dart
│   └── usecases/
│       ├── login_usecase.dart
│       ├── register_usecase.dart
│       ├── logout_usecase.dart
│       ├── google_sign_in_usecase.dart
│       ├── apple_sign_in_usecase.dart
│       └── reset_password_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── user_model.dart
│   │   ├── user_model.freezed.dart          # generated — freezed
│   │   ├── user_model.g.dart                # generated — json_serializable
│   │   ├── auth_response_model.dart
│   │   ├── auth_response_model.freezed.dart
│   │   └── auth_response_model.g.dart
│   ├── datasources/
│   │   ├── remote/
│   │   │   └── auth_remote_datasource.dart
│   │   └── local/
│   │       └── auth_local_datasource.dart
│   └── repositories/
│       └── auth_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   ├── login_page.dart
    │   ├── register_page.dart
    │   ├── forgot_password_page.dart
    │   └── onboarding_page.dart
    ├── widgets/
    │   ├── social_login_buttons.dart
    │   └── role_selector.dart
    └── providers/
        ├── auth_providers.dart
        ├── login_provider.dart
        └── register_provider.dart
```

---

## `features/property_search/`

```
features/property_search/
├── domain/
│   ├── entities/
│   │   ├── property.dart
│   │   └── search_filters.dart
│   ├── repositories/
│   │   └── property_repository.dart
│   └── usecases/
│       ├── search_properties_usecase.dart
│       └── get_listing_detail_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── property_model.dart
│   │   ├── property_model.freezed.dart
│   │   ├── property_model.g.dart
│   │   ├── search_filters_model.dart
│   │   ├── search_filters_model.freezed.dart
│   │   └── search_filters_model.g.dart
│   ├── datasources/
│   │   └── remote/
│   │       └── property_remote_datasource.dart
│   └── repositories/
│       └── property_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   ├── search_page.dart
    │   └── listing_detail_page.dart
    ├── widgets/
    │   ├── property_card.dart
    │   ├── search_filter_sheet.dart
    │   └── listing_gallery.dart
    └── providers/
        ├── search_providers.dart
        ├── search_provider.dart
        └── listing_detail_provider.dart
```

---

## `features/ai_chat/`

```
features/ai_chat/
├── domain/
│   ├── entities/
│   │   ├── chat_session.dart
│   │   ├── chat_message.dart
│   │   └── ai_agent.dart
│   ├── repositories/
│   │   └── chat_repository.dart
│   └── usecases/
│       ├── list_agents_usecase.dart
│       ├── list_sessions_usecase.dart
│       ├── send_message_usecase.dart
│       └── switch_agent_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── chat_session_model.dart
│   │   ├── chat_session_model.freezed.dart
│   │   ├── chat_session_model.g.dart
│   │   ├── chat_message_model.dart
│   │   ├── chat_message_model.freezed.dart
│   │   ├── chat_message_model.g.dart
│   │   ├── ai_agent_model.dart
│   │   ├── ai_agent_model.freezed.dart
│   │   └── ai_agent_model.g.dart
│   ├── datasources/
│   │   └── remote/
│   │       └── chat_remote_datasource.dart
│   └── repositories/
│       └── chat_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   ├── chat_list_page.dart
    │   └── chat_page.dart
    ├── widgets/
    │   ├── message_bubble.dart
    │   ├── agent_picker.dart
    │   ├── listing_card_in_chat.dart
    │   └── chat_input_bar.dart
    └── providers/
        ├── chat_providers.dart
        ├── chat_sessions_provider.dart
        └── chat_messages_provider.dart
```

---

## `features/recommendation/`

```
features/recommendation/
├── domain/
│   ├── entities/
│   │   └── recommendation_feedback.dart
│   ├── repositories/
│   │   └── recommendation_repository.dart
│   └── usecases/
│       ├── get_recommendations_usecase.dart
│       └── record_feedback_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── recommendation_model.dart
│   │   ├── recommendation_model.freezed.dart
│   │   └── recommendation_model.g.dart
│   ├── datasources/
│   │   └── remote/
│   │       └── recommendation_remote_datasource.dart
│   └── repositories/
│       └── recommendation_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   └── recommendations_page.dart
    ├── widgets/
    │   ├── recommendation_card.dart
    │   └── feedback_buttons.dart
    └── providers/
        ├── recommendation_providers.dart
        └── recommendations_feed_provider.dart
```

---

## `features/booking/`

```
features/booking/
├── domain/
│   ├── entities/
│   │   └── booking.dart
│   ├── repositories/
│   │   └── booking_repository.dart
│   └── usecases/
│       ├── request_booking_usecase.dart
│       ├── get_bookings_usecase.dart
│       ├── cancel_booking_usecase.dart
│       └── get_availability_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── booking_model.dart
│   │   ├── booking_model.freezed.dart
│   │   ├── booking_model.g.dart
│   │   ├── availability_model.dart
│   │   ├── availability_model.freezed.dart
│   │   └── availability_model.g.dart
│   ├── datasources/
│   │   └── remote/
│   │       └── booking_remote_datasource.dart
│   └── repositories/
│       └── booking_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   ├── bookings_list_page.dart
    │   ├── booking_detail_page.dart
    │   └── request_booking_page.dart
    ├── widgets/
    │   ├── booking_card.dart
    │   └── booking_status_badge.dart
    └── providers/
        ├── booking_providers.dart
        ├── bookings_list_provider.dart
        └── request_booking_provider.dart
```

---

## `features/profile/`

```
features/profile/
├── domain/
│   ├── entities/
│   │   ├── user_profile.dart
│   │   └── search_preferences.dart
│   ├── repositories/
│   │   └── profile_repository.dart
│   └── usecases/
│       ├── get_profile_usecase.dart
│       ├── update_profile_usecase.dart
│       ├── get_favorites_usecase.dart
│       ├── toggle_favorite_usecase.dart
│       └── delete_account_usecase.dart
│
├── data/
│   ├── models/
│   │   ├── profile_model.dart
│   │   ├── profile_model.freezed.dart
│   │   ├── profile_model.g.dart
│   │   ├── preferences_model.dart
│   │   ├── preferences_model.freezed.dart
│   │   └── preferences_model.g.dart
│   ├── datasources/
│   │   ├── remote/
│   │   │   └── profile_remote_datasource.dart
│   │   └── local/
│   │       └── preferences_local_datasource.dart
│   └── repositories/
│       └── profile_repository_impl.dart
│
└── presentation/
    ├── pages/
    │   ├── profile_page.dart
    │   ├── edit_profile_page.dart
    │   ├── favorites_page.dart
    │   └── settings_page.dart
    ├── widgets/
    │   ├── profile_header.dart
    │   └── preference_form.dart
    └── providers/
        ├── profile_providers.dart
        ├── profile_provider.dart
        └── favorites_provider.dart
```

---

## `features/home/`

```
features/home/
└── presentation/
    ├── pages/
    │   └── home_page.dart
    ├── widgets/
    │   ├── home_app_bar.dart
    │   └── quick_actions.dart
    └── providers/
        └── home_provider.dart
```

---

## `test/` — Mirror structure

```
test/
├── core/
│   ├── network/
│   ├── utils/
│   └── routing/
│
├── features/
│   ├── authentication/
│   │   ├── domain/
│   │   │   └── usecases/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       └── providers/
│   ├── property_search/
│   ├── ai_chat/
│   ├── recommendation/
│   ├── booking/
│   └── profile/
│
└── fixtures/
    ├── json/
    └── mocks/
```

---

## `integration_test/`

```
integration_test/
├── app_test.dart
└── flows/
    ├── auth_flow_test.dart
    ├── search_flow_test.dart
    └── booking_flow_test.dart
```

---

## Generated files (build_runner)

```
# Commands:
# dart run build_runner build --delete-conflicting-outputs

lib/**/*.freezed.dart       # freezed
lib/**/*.g.dart             # json_serializable
lib/core/di/injection.config.dart   # injectable
```

---

## Layer dependency rules

```
presentation  →  domain
data          →  domain
presentation  ↛  data          (wire via Riverpod + injectable)
domain        ↛  flutter | dio | freezed | riverpod
```

---

## Related

- [Flutter Architecture](../architecture/flutter_architecture.md)
- [README.md](./README.md)
