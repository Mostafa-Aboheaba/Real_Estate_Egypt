// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_status.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$AppStatus {
  String get message => throw _privateConstructorUsedError;
  bool get isHealthy => throw _privateConstructorUsedError;

  /// Create a copy of AppStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppStatusCopyWith<AppStatus> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppStatusCopyWith<$Res> {
  factory $AppStatusCopyWith(AppStatus value, $Res Function(AppStatus) then) =
      _$AppStatusCopyWithImpl<$Res, AppStatus>;
  @useResult
  $Res call({String message, bool isHealthy});
}

/// @nodoc
class _$AppStatusCopyWithImpl<$Res, $Val extends AppStatus>
    implements $AppStatusCopyWith<$Res> {
  _$AppStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null, Object? isHealthy = null}) {
    return _then(
      _value.copyWith(
            message: null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String,
            isHealthy: null == isHealthy
                ? _value.isHealthy
                : isHealthy // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AppStatusImplCopyWith<$Res>
    implements $AppStatusCopyWith<$Res> {
  factory _$$AppStatusImplCopyWith(
    _$AppStatusImpl value,
    $Res Function(_$AppStatusImpl) then,
  ) = __$$AppStatusImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String message, bool isHealthy});
}

/// @nodoc
class __$$AppStatusImplCopyWithImpl<$Res>
    extends _$AppStatusCopyWithImpl<$Res, _$AppStatusImpl>
    implements _$$AppStatusImplCopyWith<$Res> {
  __$$AppStatusImplCopyWithImpl(
    _$AppStatusImpl _value,
    $Res Function(_$AppStatusImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AppStatus
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? message = null, Object? isHealthy = null}) {
    return _then(
      _$AppStatusImpl(
        message: null == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String,
        isHealthy: null == isHealthy
            ? _value.isHealthy
            : isHealthy // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc

class _$AppStatusImpl implements _AppStatus {
  const _$AppStatusImpl({required this.message, required this.isHealthy});

  @override
  final String message;
  @override
  final bool isHealthy;

  @override
  String toString() {
    return 'AppStatus(message: $message, isHealthy: $isHealthy)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppStatusImpl &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.isHealthy, isHealthy) ||
                other.isHealthy == isHealthy));
  }

  @override
  int get hashCode => Object.hash(runtimeType, message, isHealthy);

  /// Create a copy of AppStatus
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppStatusImplCopyWith<_$AppStatusImpl> get copyWith =>
      __$$AppStatusImplCopyWithImpl<_$AppStatusImpl>(this, _$identity);
}

abstract class _AppStatus implements AppStatus {
  const factory _AppStatus({
    required final String message,
    required final bool isHealthy,
  }) = _$AppStatusImpl;

  @override
  String get message;
  @override
  bool get isHealthy;

  /// Create a copy of AppStatus
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppStatusImplCopyWith<_$AppStatusImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
