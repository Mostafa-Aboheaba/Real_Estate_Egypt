import 'package:property_assistant/bootstrap.dart';
import 'package:property_assistant/core/config/flavor.dart';

/// Default entry — development flavor.
Future<void> main() async {
  await bootstrap(Flavor.dev);
}
