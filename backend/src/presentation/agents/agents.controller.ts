import { Controller, Get, Headers, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProfileService } from '../../application/profile/profile.service';

@Controller('agents')
export class AgentsController {
  constructor(private readonly profile: ProfileService) {}

  @Get(':id')
  async getAgent(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.profile.getAgentPublicProfile(id, acceptLanguage);
  }
}
