import 'package:freezed_annotation/freezed_annotation.dart';

part 'failures.freezed.dart';

/// Domain-layer failure types (presentation maps to UI messages).
@freezed
class Failure with _$Failure {
  const factory Failure.server({String? message}) = ServerFailure;

  const factory Failure.network({String? message}) = NetworkFailure;

  const factory Failure.unauthorized({String? message}) = UnauthorizedFailure;

  const factory Failure.cache({String? message}) = CacheFailure;

  const factory Failure.unknown({String? message}) = UnknownFailure;
}
