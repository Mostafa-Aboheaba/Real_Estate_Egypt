import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/property_search/domain/entities/filter_option.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_filter_options.dart';
import 'package:property_assistant/features/property_search/domain/entities/property_search_filters.dart';
import 'package:property_assistant/features/property_search/presentation/providers/property_filter_options_provider.dart';

class FiltersBottomSheet extends ConsumerStatefulWidget {
  const FiltersBottomSheet({
    required this.initial,
    required this.onApply,
    super.key,
  });

  final PropertySearchFilters initial;
  final ValueChanged<PropertySearchFilters> onApply;

  @override
  ConsumerState<FiltersBottomSheet> createState() =>
      _FiltersBottomSheetState();
}

class _FiltersBottomSheetState extends ConsumerState<FiltersBottomSheet> {
  late String? _listingType;
  late String? _propertyType;
  late String? _city;
  late int? _minBedrooms;
  late int? _maxPrice;
  late String _sort;
  final _maxPriceController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _listingType = widget.initial.listingType;
    _propertyType = widget.initial.propertyType;
    _city = widget.initial.city;
    _minBedrooms = widget.initial.minBedrooms;
    _maxPrice = widget.initial.maxPrice;
    _sort = widget.initial.sort;
    if (_maxPrice != null) {
      _maxPriceController.text = _maxPrice.toString();
    }
  }

  @override
  void dispose() {
    _maxPriceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final optionsAsync = ref.watch(propertyFilterOptionsProvider);

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.paddingOf(context).bottom + 24,
      ),
      child: optionsAsync.when(
        loading: () => const SizedBox(
          height: 200,
          child: LoadingIndicator(),
        ),
        error: (e, _) => Text('Could not load filters: $e'),
        data: (options) => _buildForm(context, options),
      ),
    );
  }

  Widget _buildForm(BuildContext context, PropertyFilterOptions options) {
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Filters',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          if (options.cities.isNotEmpty) ...[
            Text('City', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            DropdownButtonFormField<String?>(
              value: _city,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Any city',
              ),
              items: [
                const DropdownMenuItem<String?>(
                  value: null,
                  child: Text('Any'),
                ),
                ...options.cities.map(
                  (FilterOption opt) => DropdownMenuItem<String?>(
                    value: opt.value,
                    child: Text(opt.label),
                  ),
                ),
              ],
              onChanged: (value) => setState(() => _city = value),
            ),
            const SizedBox(height: 16),
          ],
          Text('Max price (EGP)', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          TextField(
            controller: _maxPriceController,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'e.g. 700000',
            ),
            onChanged: (value) {
              _maxPrice = value.isEmpty ? null : int.tryParse(value);
            },
          ),
          if (options.pricePresets.isNotEmpty) ...[
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: options.pricePresets.map((FilterOption opt) {
                final preset = int.tryParse(opt.value ?? '');
                final selected = _maxPrice == preset;
                return FilterChip(
                  label: Text(opt.label),
                  selected: selected,
                  onSelected: (_) {
                    setState(() {
                      _maxPrice = preset;
                      _maxPriceController.text = preset?.toString() ?? '';
                    });
                  },
                );
              }).toList(),
            ),
          ],
          const SizedBox(height: 16),
          Text('Sort', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: options.sortOptions.map((FilterOption opt) {
              return ChoiceChip(
                label: Text(opt.label),
                selected: _sort == (opt.value ?? 'newest'),
                onSelected: (_) => setState(() {
                  _sort = opt.value ?? 'newest';
                }),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Text('Listing type', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          SegmentedButton<String?>(
            segments: options.listingTypes
                .map(
                  (FilterOption opt) => ButtonSegment<String?>(
                    value: opt.value,
                    label: Text(opt.label),
                  ),
                )
                .toList(),
            selected: {_listingType},
            onSelectionChanged: (s) => setState(() => _listingType = s.first),
          ),
          const SizedBox(height: 16),
          Text('Property type', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: options.propertyTypes.map((FilterOption opt) {
              final selected = _propertyType == opt.value;
              return FilterChip(
                label: Text(opt.label),
                selected: selected,
                onSelected: (_) => setState(() {
                  _propertyType = selected ? null : opt.value;
                }),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          Text('Min bedrooms', style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: options.bedroomOptions.map((FilterOption opt) {
              final min = opt.value == null ? null : int.tryParse(opt.value!);
              final selected = _minBedrooms == min;
              return FilterChip(
                label: Text(opt.label),
                selected: selected,
                onSelected: (_) => setState(() => _minBedrooms = min),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              widget.onApply(
                widget.initial.copyWith(
                  city: _city,
                  listingType: _listingType,
                  propertyType: _propertyType,
                  minBedrooms: _minBedrooms,
                  maxPrice: _maxPrice,
                  sort: _sort,
                  page: 1,
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
}
