import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const safePath = originalUrl.split('?')[0].replace(/(\/sub\/)[^/]+/, '$1[redacted]');
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      this.logger.log(`${method} ${safePath} ${statusCode} ${duration}ms - ${ip}`);
    });

    next();
  }
}
