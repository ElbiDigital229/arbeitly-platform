import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { HttpError } from '../errors/HttpError.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

function isZodSchema(value: ZodSchema | ValidationSchemas): value is ZodSchema {
  return typeof (value as ZodSchema).safeParse === 'function';
}

function formatZodErrors(error: import('zod').ZodError): string {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
}

/**
 * Validate request data against a Zod schema.
 *
 * Two forms:
 *   validate(BodySchema)
 *   validate({ body: BodySchema, params: ParamsSchema, query: QuerySchema })
 */
export function validate(schemaOrSchemas: ZodSchema | ValidationSchemas): RequestHandler {
  const schemas: ValidationSchemas = isZodSchema(schemaOrSchemas)
    ? { body: schemaOrSchemas }
    : schemaOrSchemas;

  return (req, _res, next) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) return next(HttpError.unprocessable(formatZodErrors(result.error)));
      req.body = result.data;
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) return next(HttpError.unprocessable(formatZodErrors(result.error)));
      req.params = result.data;
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) return next(HttpError.unprocessable(formatZodErrors(result.error)));
      Object.assign(req.query, result.data);
    }
    next();
  };
}
