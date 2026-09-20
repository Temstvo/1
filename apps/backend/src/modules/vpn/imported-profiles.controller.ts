import { Controller, Get, Param, UseGuards, Header } from '@nestjs/common';
import { ImportedProfilesService } from './imported-profiles.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
@Controller('vpn/imported')
export class ImportedProfilesController {
  constructor(private profiles: ImportedProfilesService) {}
  @Get('servers') @Header('Cache-Control', 'no-store') list() {
    return this.profiles.list();
  }
  @Get('servers/:id/config') @UseGuards(JwtAuthGuard) @Header('Cache-Control', 'no-store') config(
    @Param('id') id: string,
  ) {
    return this.profiles.download(id);
  }
}
