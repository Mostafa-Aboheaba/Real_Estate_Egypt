import 'package:flutter/material.dart';
import 'package:property_assistant/core/theme/app_colors.dart';
import 'package:property_assistant/core/theme/app_typography.dart';

abstract final class AppTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.seed,
      brightness: Brightness.light,
      surface: AppColors.surfaceLight,
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
    );
    return base.copyWith(textTheme: AppTypography.textTheme(base.textTheme));
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.seed,
      brightness: Brightness.dark,
      surface: AppColors.surfaceDark,
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
    );
    return base.copyWith(textTheme: AppTypography.textTheme(base.textTheme));
  }
}
