import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_status.freezed.dart';

@freezed
class AppStatus with _$AppStatus {
  const factory AppStatus({
    required String message,
    required bool isHealthy,
  }) = _AppStatus;
}
