import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../../domain/shared/domain.error';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const notFound = exception.code.endsWith('_NOT_FOUND');
    const unauthorized =
      exception.code === 'INVALID_CREDENTIALS' ||
      exception.code === 'UNAUTHORIZED';

    let status = HttpStatus.BAD_REQUEST;
    if (notFound) status = HttpStatus.NOT_FOUND;
    else if (unauthorized) status = HttpStatus.UNAUTHORIZED;
    else if (exception.code === 'EMAIL_IN_USE') status = HttpStatus.CONFLICT;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
    });
  }
}
