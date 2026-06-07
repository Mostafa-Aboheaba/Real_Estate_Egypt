class AiAgent {
  const AiAgent({
    required this.id,
    required this.name,
    this.description,
    this.isDefault = false,
  });

  final String id;
  final String name;
  final String? description;
  final bool isDefault;
}
