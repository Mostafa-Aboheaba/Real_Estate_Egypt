class ChatStreamChunk {
  const ChatStreamChunk.text(this.text) : uiSurface = null;

  const ChatStreamChunk.surface(this.uiSurface) : text = null;

  final String? text;
  final Map<String, dynamic>? uiSurface;

  bool get isText => text != null;
  bool get isSurface => uiSurface != null;
}
