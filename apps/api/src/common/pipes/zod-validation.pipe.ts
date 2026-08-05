import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    // Only validate the body of the request
    if (metadata.type !== 'body') {
      return value;
    }

    try {
      const parsedValue = this.schema.parse(value) as unknown;
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        throw new BadRequestException(`Validation failed - ${message}`);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
