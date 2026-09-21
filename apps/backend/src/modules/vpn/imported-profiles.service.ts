import {
  Injectable,
  OnModuleInit,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { ImportedProfile, loadImportedProfiles } from './imported-profiles';
@Injectable()
export class ImportedProfilesService implements OnModuleInit {
  private profiles = new Map<string, ImportedProfile>();
  private logger = new Logger(ImportedProfilesService.name);
  constructor(private config: ConfigService) {}
  async onModuleInit() {
    const source =
      this.config.get<string>('SERV_CONFIGS_DIR') ||
      resolve(__dirname, '../../../../../serv-configs');
    const result = await loadImportedProfiles(source);
    this.profiles = result.profiles;
    this.logger.log(
      `Imported ${this.profiles.size} profiles from ${result.files} files; ${result.duplicates} duplicates; ${result.rejected.length} rejected`,
    );
  }
  list() {
    if (this.config.get('PILOT_MODE') === 'true')
      return { profiles: [], downloadEnabled: false, managed: true };
    return {
      profiles: [...this.profiles.values()]
        .map((p) => ({ ...p.summary, availability: 'UNVERIFIED' }))
        .sort(
          (a, b) =>
            a.country.localeCompare(b.country, 'ru') ||
            a.name.localeCompare(b.name, 'ru', { numeric: true }),
        ),
      downloadEnabled: this.config.get('ENABLE_IMPORTED_VPN_ACCESS') === 'true',
    };
  }
  download(id: string) {
    if (this.config.get('ENABLE_IMPORTED_VPN_ACCESS') !== 'true')
      throw new ForbiddenException('Экспорт импортированных профилей отключён оператором');
    const profile = this.profiles.get(id);
    if (!profile) throw new NotFoundException('Профиль не найден');
    return {
      name: profile.summary.name,
      filename: 'appi-' + id + '.json',
      format: 'xray-json',
      config: profile.document,
    };
  }
}
