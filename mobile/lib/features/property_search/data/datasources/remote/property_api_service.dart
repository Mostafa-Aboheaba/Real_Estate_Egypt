import 'package:dio/dio.dart';
import 'package:property_assistant/core/constants/api_constants.dart';
import 'package:property_assistant/features/property_search/data/models/property_detail_dto.dart';
import 'package:property_assistant/features/property_search/data/models/property_search_response_dto.dart';
import 'package:retrofit/retrofit.dart';

part 'property_api_service.g.dart';

@RestApi()
abstract class PropertyApiService {
  factory PropertyApiService(Dio dio) = _PropertyApiService;

  @GET(ApiConstants.properties)
  Future<PropertySearchResponseDto> search(
    @Queries() Map<String, dynamic> query,
  );

  @GET('${ApiConstants.properties}/{id}')
  Future<PropertyDetailDto> getDetail(@Path('id') String id);
}
