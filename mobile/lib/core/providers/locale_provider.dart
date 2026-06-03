import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User locale preference (ar-EG / en).
final localeProvider = StateProvider<Locale>((ref) {
  return const Locale('ar', 'EG');
});
