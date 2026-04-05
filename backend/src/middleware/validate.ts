import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod/v4";
import { ValidationError } from "../errors/index.ts";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) throw new ValidationError(result.error.message);
      req.body = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) throw new ValidationError(result.error.message);
      req.query = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) throw new ValidationError(result.error.message);
      req.params = result.data;
    }

    next();
  };
}
