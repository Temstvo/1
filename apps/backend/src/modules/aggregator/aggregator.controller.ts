import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AggregatorScheduler } from './aggregator.scheduler';

@ApiTags('admin')
@Controller('admin/aggregator')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AggregatorController {
  constructor(private sched: AggregatorScheduler) {}

  @Post('run')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async run() {
    await this.sched.runOnce();
    return { ok: true };
  }
}
