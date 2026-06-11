import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';
import 'package:property_assistant/core/widgets/loading_indicator.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/profile/presentation/providers/profile_provider.dart';
import 'package:property_assistant/l10n/app_localizations.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(userProfileProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final profile = ref.watch(userProfileProvider);

    return AppScaffold(
      title: l10n.profileTitle,
      body: profile.when(
        loading: () => const LoadingIndicator(),
        error: (e, _) => Center(child: Text('$e')),
        data: (p) {
          if (p == null) {
            return Center(child: Text(l10n.profileSignInRequired));
          }
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ListTile(
                leading: const Icon(Icons.person_outline),
                title: Text(p.name ?? p.email),
                subtitle: Text(p.email),
              ),
              ListTile(
                leading: const Icon(Icons.phone_outlined),
                title: Text(l10n.profilePhone),
                subtitle: Text(p.phone ?? '—'),
              ),
              ListTile(
                leading: const Icon(Icons.language),
                title: Text(l10n.profileLanguage),
                subtitle: Text(p.locale),
              ),
              if (p.preferredAgentId != null)
                ListTile(
                  leading: const Icon(Icons.smart_toy_outlined),
                  title: Text(l10n.profileDefaultAgent),
                  subtitle: Text(p.preferredAgentId!),
                ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.favorite_outline),
                title: Text(l10n.profileFavorites),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push(RoutePaths.favorites),
              ),
              if (p.role == 'agent')
                ListTile(
                  leading: const Icon(Icons.inbox_outlined),
                  title: Text(l10n.agentBookingsTitle),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => context.push(RoutePaths.agentBookings),
                ),
              ListTile(
                leading: const Icon(Icons.edit_outlined),
                title: Text(l10n.profileEdit),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push(RoutePaths.editProfile),
              ),
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: () =>
                    ref.read(authSessionProvider.notifier).logout(),
                child: Text(l10n.profileSignOut),
              ),
            ],
          );
        },
      ),
    );
  }
}
