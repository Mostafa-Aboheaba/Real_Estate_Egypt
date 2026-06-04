import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/profile/presentation/providers/profile_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class EditProfilePage extends ConsumerStatefulWidget {
  const EditProfilePage({super.key});

  @override
  ConsumerState<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends ConsumerState<EditProfilePage> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  String _locale = 'en';
  String? _preferredAgentId;
  bool _saving = false;

  static const _agentIds = [
    'search-agent',
    'recommendation-agent',
    'booking-agent',
    'followup-agent',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final profile = ref.watch(userProfileProvider);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.profileEdit)),
      body: profile.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => Center(child: Text('$e')),
        data: (p) {
          if (p != null && _nameController.text.isEmpty) {
            _nameController.text = p.name ?? '';
            _phoneController.text = p.phone ?? '';
            _locale = p.locale;
            _preferredAgentId = p.preferredAgentId;
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              TextField(
                controller: _nameController,
                decoration: InputDecoration(labelText: l10n.profileName),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: l10n.profilePhone,
                  hintText: '+201012345678',
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _locale,
                decoration: InputDecoration(labelText: l10n.profileLanguage),
                items: const [
                  DropdownMenuItem(value: 'en', child: Text('English')),
                  DropdownMenuItem(value: 'ar-EG', child: Text('العربية')),
                ],
                onChanged: (v) {
                  if (v != null) {
                    setState(() => _locale = v);
                  }
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _preferredAgentId,
                decoration: InputDecoration(
                  labelText: l10n.profileDefaultAgent,
                ),
                items: [
                  const DropdownMenuItem(
                    value: null,
                    child: Text('—'),
                  ),
                  ..._agentIds.map(
                    (id) => DropdownMenuItem(value: id, child: Text(id)),
                  ),
                ],
                onChanged: (v) => setState(() => _preferredAgentId = v),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _saving ? null : () => _save(context),
                child: _saving
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(l10n.profileSave),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _save(BuildContext context) async {
    setState(() => _saving = true);
    try {
      await ref.read(userProfileProvider.notifier).saveProfile(
            name: _nameController.text.trim(),
            phone: _phoneController.text.trim(),
            locale: _locale,
            preferredAgentId: _preferredAgentId,
          );
      if (context.mounted) {
        context.pop();
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }
}
