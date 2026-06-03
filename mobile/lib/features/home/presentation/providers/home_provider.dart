import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/config/app_config.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/network/api_client.dart';
import 'package:property_assistant/features/home/data/models/app_status.dart';

final homeBootstrapProvider = FutureProvider<AppStatus>((ref) async {
  final client = getIt<ApiClient>();
  final config = getIt<AppConfig>();
  try {
    await client.get<Map<String, dynamic>>('${config.apiRootUrl}/health');
    return const AppStatus(message: 'API reachable', isHealthy: true);
  } catch (_) {
    return const AppStatus(
      message: 'API offline (expected until backend M2)',
      isHealthy: false,
    );
  }
});
