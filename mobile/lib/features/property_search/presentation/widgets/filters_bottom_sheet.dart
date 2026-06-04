import 'package:flutter/material.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';

class FiltersBottomSheet extends StatefulWidget {
  const FiltersBottomSheet({
    required this.initial,
    required this.onApply,
    super.key,
  });

  final PropertySearchFilters initial;
  final ValueChanged<PropertySearchFilters> onApply;

  @override
  State<FiltersBottomSheet> createState() => _FiltersBottomSheetState();
}

class _FiltersBottomSheetState extends State<FiltersBottomSheet> {
  late String? _listingType;
  late String? _propertyType;
  late int? _minBedrooms;

  @override
  void initState() {
    super.initState();
    _listingType = widget.initial.listingType;
    _propertyType = widget.initial.propertyType;
    _minBedrooms = widget.initial.minBedrooms;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.paddingOf(context).bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Filters',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          Text('Listing type', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          SegmentedButton<String?>(
            segments: const [
              ButtonSegment(value: null, label: Text('Any')),
              ButtonSegment(value: 'sale', label: Text('Sale')),
              ButtonSegment(value: 'rent', label: Text('Rent')),
            ],
            selected: {_listingType},
            onSelectionChanged: (s) => setState(() => _listingType = s.first),
          ),
          const SizedBox(height: 16),
          Text('Property type', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              _typeChip('apartment', 'Apartment'),
              _typeChip('villa', 'Villa'),
              _typeChip('duplex', 'Duplex'),
            ],
          ),
          const SizedBox(height: 16),
          Text('Min bedrooms', style: Theme.of(context).textTheme.labelLarge),
          Slider(
            value: (_minBedrooms ?? 0).toDouble(),
            min: 0,
            max: 5,
            divisions: 5,
            label: _minBedrooms == null || _minBedrooms == 0
                ? 'Any'
                : '$_minBedrooms+',
            onChanged: (v) => setState(() {
              _minBedrooms = v == 0 ? null : v.round();
            }),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              widget.onApply(
                widget.initial.copyWith(
                  listingType: _listingType,
                  propertyType: _propertyType,
                  minBedrooms: _minBedrooms,
                ),
              );
              Navigator.pop(context);
            },
            child: const Text('Apply filters'),
          ),
        ],
      ),
    );
  }

  Widget _typeChip(String value, String label) {
    final selected = _propertyType == value;
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => setState(() {
        _propertyType = selected ? null : value;
      }),
    );
  }
}
