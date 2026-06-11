import 'package:flutter/material.dart';
import 'package:genui/genui.dart';
import 'package:property_assistant/features/ai_chat/genui/property_assistant_catalog.dart';

/// Renders a persisted or streamed A2UI surface payload in chat.
class A2uiSurfaceView extends StatefulWidget {
  const A2uiSurfaceView({
    required this.uiSurface,
    super.key,
  });

  final Map<String, dynamic> uiSurface;

  @override
  State<A2uiSurfaceView> createState() => _A2uiSurfaceViewState();
}

class _A2uiSurfaceViewState extends State<A2uiSurfaceView> {
  late final SurfaceController _controller;
  String? _surfaceId;

  @override
  void initState() {
    super.initState();
    _controller = SurfaceController(
      catalogs: [propertyAssistantCatalog()],
    );
    _applySurface(widget.uiSurface);
    _controller.surfaceUpdates.listen((_) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void didUpdateWidget(covariant A2uiSurfaceView oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.uiSurface != widget.uiSurface) {
      _applySurface(widget.uiSurface);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _applySurface(Map<String, dynamic> uiSurface) {
    final messages = uiSurface['messages'];
    if (messages is! List) {
      return;
    }
    for (final raw in messages) {
      if (raw is Map<String, dynamic>) {
        _controller.handleMessage(A2uiMessage.fromJson(raw));
      }
    }
    _surfaceId = uiSurface['surfaceId'] as String?;
  }

  @override
  Widget build(BuildContext context) {
    final surfaceId = _surfaceId;
    if (surfaceId == null || !_controller.activeSurfaceIds.contains(surfaceId)) {
      return const SizedBox.shrink();
    }

    return Surface(
      surfaceContext: _controller.contextFor(surfaceId),
    );
  }
}
