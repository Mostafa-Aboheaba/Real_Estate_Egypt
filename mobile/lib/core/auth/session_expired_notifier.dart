import 'dart:async';
import 'package:injectable/injectable.dart';

/// Fired when refresh token renewal fails (session no longer valid).
@lazySingleton
class SessionExpiredNotifier {
  final _controller = StreamController<void>.broadcast();

  Stream<void> get onExpired => _controller.stream;

  void notify() {
    if (!_controller.isClosed) {
      _controller.add(null);
    }
  }
}
