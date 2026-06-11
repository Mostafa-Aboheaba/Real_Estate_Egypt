import 'package:flutter_test/flutter_test.dart';
import 'package:property_assistant/features/ai_chat/genui/property_assistant_catalog.dart';

void main() {
  test('property assistant catalog registers GenUI components', () {
    final catalog = propertyAssistantCatalog();
    final names = catalog.items.map((item) => item.name).toSet();

    expect(catalog.catalogId, propertyAssistantCatalogId);
    expect(names, contains('PropertyCarousel'));
    expect(names, contains('PropertyCard'));
    expect(names, contains('PrimaryButton'));
  });
}
