import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/di/injection.dart';
import 'package:property_assistant/core/network/network_info.dart';

final connectivityProvider = FutureProvider<bool>((ref) async {
  return getIt<NetworkInfo>().isConnected;
});
