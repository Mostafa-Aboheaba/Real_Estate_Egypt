import 'package:property_assistant/features/profile/data/models/favorite_item_dto.dart';
import 'package:property_assistant/features/profile/data/models/favorites_page_dto.dart';
import 'package:property_assistant/features/profile/data/models/user_profile_dto.dart';
import 'package:property_assistant/features/profile/domain/entities/favorite_item.dart';
import 'package:property_assistant/features/profile/domain/entities/user_profile.dart';
import 'package:property_assistant/features/property_search/data/mappers/property_mapper.dart';

abstract final class ProfileMapper {
  static UserProfile toProfile(UserProfileDto dto) {
    return UserProfile(
      id: dto.id,
      email: dto.email,
      role: dto.role,
      emailVerified: dto.emailVerified,
      locale: dto.locale,
      name: dto.name,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      preferredAgentId: dto.preferredAgentId,
      searchPreferences: dto.searchPreferences,
      createdAt: dto.createdAt,
    );
  }

  static FavoriteItem toFavoriteItem(FavoriteItemDto dto) {
    return FavoriteItem(
      id: dto.id,
      propertyId: dto.propertyId,
      createdAt: dto.createdAt,
      property: PropertyMapper.toListItem(dto.property),
    );
  }

  static FavoritesPage toFavoritesPage(FavoritesPageDto dto) {
    return FavoritesPage(
      items: dto.items.map(toFavoriteItem).toList(),
      page: dto.pagination.page,
      limit: dto.pagination.limit,
      total: dto.pagination.total,
      hasMore: dto.pagination.hasMore,
    );
  }
}
