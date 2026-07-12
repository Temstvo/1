import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async getInvoices(@CurrentUser('id') userId: string) {
    return this.invoicesService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  async getInvoice(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findById(id, userId);
  }
}
