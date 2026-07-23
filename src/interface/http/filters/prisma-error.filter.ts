import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientRustPanicError,
)
export class PrismaErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'DATABASE_ERROR';
    let message = 'Erro no banco de dados.';

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'DB_UNAVAILABLE';
      message =
        'Banco de dados indisponível. Confira se o Postgres está rodando e se DATABASE_URL está correto.';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2021' || exception.code === 'P2010') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        code = 'FLOW_SCHEMA_MISSING';
        message =
          'Tabela de fluxogramas ainda não existe. No backend rode: npx prisma migrate deploy';
      } else if (exception.code === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        code = 'FOREIGN_KEY';
        message = 'Grupo de cartas inválido ou removido.';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        code = 'NOT_FOUND';
        message = 'Registro não encontrado.';
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
    });
  }
}
