import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:injectable/injectable.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/config/flavor.dart';
import 'package:property_assistant/features/profile/data/datasources/remote/profile_api_service.dart';
import 'package:property_assistant/features/property_search/data/datasources/remote/property_api_service.dart';
import 'package:property_assistant/features/booking/data/datasources/remote/booking_api_service.dart';
import 'package:property_assistant/features/recommendation/data/datasources/remote/recommendation_api_service.dart';

@module
abstract class RegisterModule {
  @lazySingleton
  AppConfig appConfig() => AppConfig.forFlavor(currentFlavor);

  @lazySingleton
  FlutterSecureStorage get secureStorage => const FlutterSecureStorage();

  @lazySingleton
  Connectivity get connectivity => Connectivity();

  @lazySingleton
  PropertyApiService propertyApiService(Dio dio) => PropertyApiService(dio);

  @lazySingleton
  ProfileApiService profileApiService(Dio dio) => ProfileApiService(dio);

  @lazySingleton
  RecommendationApiService recommendationApiService(Dio dio) =>
      RecommendationApiService(dio);

  @lazySingleton
  BookingApiService bookingApiService(Dio dio) => BookingApiService(dio);
}

/// Set in flavor entry points before [configureDependencies].
Flavor currentFlavor = Flavor.dev;
