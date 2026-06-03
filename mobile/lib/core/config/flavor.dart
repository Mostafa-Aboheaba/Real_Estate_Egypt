/// Build flavor — set via entry point (`main_dev.dart`, etc.).
enum Flavor {
  dev,
  staging,
  prod;

  String get name => switch (this) {
        Flavor.dev => 'dev',
        Flavor.staging => 'staging',
        Flavor.prod => 'prod',
      };

  bool get isProduction => this == Flavor.prod;
}
