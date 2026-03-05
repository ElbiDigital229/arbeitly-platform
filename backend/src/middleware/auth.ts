import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import { config } from "../config/index.ts";
import { UnauthorizedError } from "../errors/index.ts";

const jwksClient = jwksRsa({
  jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err || !key) return reject(err ?? new Error("No signing key found"));
      resolve(key.getPublicKey());
    });
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) throw new UnauthorizedError("Invalid token");

    const signingKey = await getSigningKey(decoded.header);

    const payload = jwt.verify(token, signingKey, {
      audience: config.AUTH0_AUDIENCE,
      issuer: `https://${config.AUTH0_DOMAIN}/`,
      algorithms: ["RS256"],
    });

    (req as any).auth = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token verification failed");
  }
}
