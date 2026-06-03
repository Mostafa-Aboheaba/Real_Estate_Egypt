import 'package:property_assistant/bootstrap.dart';
import 'package:property_assistant/core/config/flavor.dart';

Future<void> main() async {
  await bootstrap(Flavor.prod);
}
