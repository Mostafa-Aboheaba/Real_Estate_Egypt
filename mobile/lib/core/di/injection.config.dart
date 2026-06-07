// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// InjectableConfigGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:connectivity_plus/connectivity_plus.dart' as _i895;
import 'package:dio/dio.dart' as _i361;
import 'package:flutter_secure_storage/flutter_secure_storage.dart' as _i558;
import 'package:get_it/get_it.dart' as _i174;
import 'package:injectable/injectable.dart' as _i526;

import '../../features/ai_chat/data/datasources/chat_remote_datasource.dart'
    as _i696;
import '../../features/ai_chat/data/repositories/chat_repository_impl.dart'
    as _i203;
import '../../features/ai_chat/domain/repositories/chat_repository.dart'
    as _i203;
import '../../features/authentication/data/datasources/auth_remote_datasource.dart'
    as _i14;
import '../../features/authentication/data/repositories/auth_repository_impl.dart'
    as _i317;
import '../../features/authentication/domain/repositories/auth_repository.dart'
    as _i742;
import '../../features/profile/data/datasources/remote/profile_api_service.dart'
    as _i428;
import '../../features/profile/data/datasources/remote/profile_remote_datasource.dart'
    as _i750;
import '../../features/profile/data/repositories/profile_repository_impl.dart'
    as _i334;
import '../../features/profile/domain/repositories/profile_repository.dart'
    as _i894;
import '../../features/property_search/data/datasources/local/property_filter_local_datasource.dart'
    as _i37;
import '../../features/property_search/data/datasources/remote/property_api_service.dart'
    as _i787;
import '../../features/property_search/data/datasources/remote/property_remote_datasource.dart'
    as _i993;
import '../../features/property_search/data/repositories/property_filter_repository_impl.dart'
    as _i720;
import '../../features/property_search/data/repositories/property_repository_impl.dart'
    as _i2;
import '../../features/property_search/domain/repositories/property_filter_repository.dart'
    as _i209;
import '../../features/property_search/domain/repositories/property_repository.dart'
    as _i727;
import '../auth/session_expired_notifier.dart' as _i45;
import '../auth/token_storage.dart' as _i1002;
import '../config/app_config.dart' as _i650;
import '../network/api_client.dart' as _i557;
import '../network/auth_interceptor.dart' as _i908;
import '../network/dio_factory.dart' as _i798;
import '../network/logging_interceptor.dart' as _i551;
import '../network/network_info.dart' as _i932;
import 'register_module.dart' as _i291;

extension GetItInjectableX on _i174.GetIt {
  // initializes the registration of main-scope dependencies inside of GetIt
  _i174.GetIt init({
    String? environment,
    _i526.EnvironmentFilter? environmentFilter,
  }) {
    final gh = _i526.GetItHelper(this, environment, environmentFilter);
    final registerModule = _$RegisterModule();
    final dioModule = _$DioModule();
    gh.lazySingleton<_i558.FlutterSecureStorage>(
      () => registerModule.secureStorage,
    );
    gh.lazySingleton<_i895.Connectivity>(() => registerModule.connectivity);
    gh.lazySingleton<_i650.AppConfig>(() => registerModule.appConfig());
    gh.lazySingleton<_i45.SessionExpiredNotifier>(
      () => _i45.SessionExpiredNotifier(),
    );
    gh.lazySingleton<_i37.PropertyFilterLocalDataSource>(
      () => _i37.PropertyFilterLocalDataSource(),
    );
    gh.lazySingleton<_i932.NetworkInfo>(
      () => _i932.NetworkInfoImpl(gh<_i895.Connectivity>()),
    );
    gh.lazySingleton<_i1002.TokenStorage>(
      () => _i1002.TokenStorage(gh<_i558.FlutterSecureStorage>()),
    );
    gh.lazySingleton<_i551.LoggingInterceptor>(
      () => dioModule.loggingInterceptor(gh<_i650.AppConfig>()),
    );
    gh.lazySingleton<_i209.PropertyFilterRepository>(
      () => _i720.PropertyFilterRepositoryImpl(
        gh<_i37.PropertyFilterLocalDataSource>(),
      ),
    );
    gh.lazySingleton<_i361.Dio>(
      () => dioModule.refreshDio(
        gh<_i650.AppConfig>(),
        gh<_i551.LoggingInterceptor>(),
      ),
      instanceName: 'refresh',
    );
    gh.lazySingleton<_i908.AuthInterceptor>(
      () => _i908.AuthInterceptor(
        gh<_i1002.TokenStorage>(),
        gh<_i45.SessionExpiredNotifier>(),
        refreshDio: gh<_i361.Dio>(instanceName: 'refresh'),
      ),
    );
    gh.lazySingleton<_i361.Dio>(
      () => dioModule.dio(
        gh<_i650.AppConfig>(),
        gh<_i908.AuthInterceptor>(),
        gh<_i551.LoggingInterceptor>(),
      ),
    );
    gh.lazySingleton<_i787.PropertyApiService>(
      () => registerModule.propertyApiService(gh<_i361.Dio>()),
    );
    gh.lazySingleton<_i428.ProfileApiService>(
      () => registerModule.profileApiService(gh<_i361.Dio>()),
    );
    gh.lazySingleton<_i696.ChatRemoteDataSource>(
      () => _i696.ChatRemoteDataSource(gh<_i361.Dio>()),
    );
    gh.lazySingleton<_i993.PropertyRemoteDataSource>(
      () => _i993.PropertyRemoteDataSource(gh<_i787.PropertyApiService>()),
    );
    gh.lazySingleton<_i557.ApiClient>(
      () => _i557.ApiClient(gh<_i361.Dio>(), gh<_i932.NetworkInfo>()),
    );
    gh.lazySingleton<_i203.ChatRepository>(
      () => _i203.ChatRepositoryImpl(gh<_i696.ChatRemoteDataSource>()),
    );
    gh.lazySingleton<_i727.PropertyRepository>(
      () => _i2.PropertyRepositoryImpl(gh<_i993.PropertyRemoteDataSource>()),
    );
    gh.lazySingleton<_i14.AuthRemoteDataSource>(
      () => _i14.AuthRemoteDataSource(gh<_i557.ApiClient>()),
    );
    gh.lazySingleton<_i750.ProfileRemoteDataSource>(
      () => _i750.ProfileRemoteDataSource(gh<_i428.ProfileApiService>()),
    );
    gh.lazySingleton<_i742.AuthRepository>(
      () => _i317.AuthRepositoryImpl(
        gh<_i14.AuthRemoteDataSource>(),
        gh<_i1002.TokenStorage>(),
      ),
    );
    gh.lazySingleton<_i894.ProfileRepository>(
      () => _i334.ProfileRepositoryImpl(gh<_i750.ProfileRemoteDataSource>()),
    );
    return this;
  }
}

class _$RegisterModule extends _i291.RegisterModule {}

class _$DioModule extends _i798.DioModule {}
