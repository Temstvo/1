import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GrowthService } from './growth.service';

@ApiTags('growth')
@Controller('growth')
export class GrowthController {
  constructor(private readonly growth: GrowthService) {}

  @Post('referral')
  @ApiOperation({ summary: 'Record referral: invited user came from inviter (ref code)' })
  async referral(@Body() body: { telegramId: string; refCode: string }) {
    if (!body?.telegramId || !body?.refCode)
      throw new HttpException('telegramId and refCode required', HttpStatus.BAD_REQUEST);
    const r = await this.growth.recordReferral(String(body.telegramId), String(body.refCode));
    const stats = await this.growth.stats(String(body.telegramId)).catch(() => null);
    return { ...r, stats };
  }

  @Get('stats/:telegramId')
  @ApiOperation({ summary: 'Referral count + premium status for Telegram user' })
  async stats(@Param('telegramId') telegramId: string) {
    return this.growth.stats(String(telegramId));
  }

  @Post('extend')
  @ApiOperation({ summary: 'Extend user sub link by N days' })
  async extend(@Body() body: { telegramId: string; days: number }) {
    if (!body?.telegramId || !body?.days)
      throw new HttpException('telegramId and days required', HttpStatus.BAD_REQUEST);
    const expiresAt = await this.growth.extendSub(String(body.telegramId), Number(body.days));
    return { telegramId: String(body.telegramId), days: Number(body.days), expiresAt };
  }

  @Post('premium/grant')
  @ApiOperation({ summary: 'Grant premium (Stars/crypto/manual) + extend sub' })
  async grant(@Body() body: { telegramId: string; days: number; stars?: number; source?: string }) {
    if (!body?.telegramId || !body?.days)
      throw new HttpException('telegramId and days required', HttpStatus.BAD_REQUEST);
    return this.growth.grantPremium(
      String(body.telegramId),
      Number(body.days),
      Number(body.stars || 0),
      String(body.source || 'manual'),
    );
  }
}
