import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { JSendResponse } from '@alpha/types';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const responseData = exception.getResponse() as any;
      
      if (typeof responseData === 'string') {
        message = responseData;
      } else if (Array.isArray(responseData.message)) {
        message = responseData.message.join(', ');
      } else {
        message = responseData.message || responseData.error || message;
      }
    } else if (exception instanceof Error) {
      // In production, you might not want to expose raw error messages for 500 errors
      message = exception.message;
    }

    const errorResponse: JSendResponse = {
      status: 'error',
      message,
      data: null,
    };

    response.status(status).json(errorResponse);
  }
}
