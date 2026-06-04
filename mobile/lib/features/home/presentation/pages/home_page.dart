import 'package:flutter/material.dart';
import 'package:property_assistant/l10n/app_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:property_assistant/core/providers/app_providers.dart';
import 'package:property_assistant/core/routing/route_paths.dart';
import 'package:property_assistant/core/widgets/app_scaffold.dart';
import 'package:property_assistant/features/authentication/presentation/providers/auth_provider.dart';
import 'package:property_assistant/features/home/presentation/providers/home_provider.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final config = ref.watch(appConfigProvider);
    final bootstrap = ref.watch(homeBootstrapProvider);
    final session = ref.watch(authSessionProvider);

    return AppScaffold(
      title: l10n.appTitle,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.homeWelcome,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(l10n.homeSubtitle),
            const SizedBox(height: 24),
            session.when(
              data: (s) => s == null
                  ? const SizedBox.shrink()
                  : Text('Signed in as ${s.user.email}'),
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Text('Session: $e'),
            ),
            const SizedBox(height: 16),
            bootstrap.when(
              data: (status) => Text(status.message),
              loading: () => const LinearProgressIndicator(),
              error: (e, _) => Text('Bootstrap: $e'),
            ),
            FilledButton.icon(
              onPressed: () => context.push(RoutePaths.search),
              icon: const Icon(Icons.search),
              label: Text(l10n.browseProperties),
            ),
            const Spacer(),
            Text(
              'Flavor: ${config.flavor.name}',
              style: Theme.of(context).textTheme.labelSmall,
            ),
            Text(
              'API: ${config.apiBaseUrl}',
              style: Theme.of(context).textTheme.labelSmall,
            ),
            const SizedBox(height: 16),
            session.valueOrNull == null
                ? FilledButton(
                    onPressed: () => context.push(RoutePaths.login),
                    child: const Text('Sign in'),
                  )
                : OutlinedButton(
                    onPressed: () =>
                        ref.read(authSessionProvider.notifier).logout(),
                    child: const Text('Sign out'),
                  ),
          ],
        ),
      ),
    );
  }
}
