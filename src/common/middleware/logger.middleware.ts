import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const loggerColor =
        200 <= statusCode && statusCode < 300
          ? 200
          : 300 <= statusCode && statusCode < 400
          ? 300
          : 400 <= statusCode && statusCode < 500
          ? 400
          : 500;

      switch (loggerColor) {
        case 200:
        case 300:
          this.logger.verbose(
            `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
          );
          break;
        case 400:
          this.logger.warn(
            `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
          );
          break;
        case 500:
          this.logger.error(
            `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
          );
          break;
      }
    });

    next();
  }
}
