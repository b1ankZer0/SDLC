import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export async function createJwt(c, payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1d",
    });

    setCookie(c, "authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prod",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 1, // 1 day in seconds
    });
  } catch (err) {
    console.error("Error creating JWT:", err);
    throw new Error("Failed to create JWT");
  }
}

export async function verifyJwt(c) {
  try {
    const token = getCookie(c, "authToken");
    if (!token) {
      console.error("No token found in cookies");
      return null;
    }

    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

export async function logout(c) {
  await deleteCookie(c, "authToken");
}

export function authMiddleware(required: true, roles: string[] = []) {
  return async (c, next) => {
    try {
      // Verify JWT token from cookie
      const userData = await verifyJwt(c);

      // If no token or invalid token and auth is required
      if (!userData && required) {
        throw new HTTPException(401, { message: "Authentication required" });
      }

      // If user is authenticated, check roles if specified
      if (userData && roles && roles.length > 0) {
        const hasRequiredRole = roles.includes(userData.role);

        if (!hasRequiredRole) {
          throw new HTTPException(403, { message: "Insufficient permissions" });
        }
      }

      // Attach user data to context if available
      if (userData) {
        c.set("user", userData);
      }

      // Continue to next middleware/handler
      await next();
    } catch (err) {
      if (err instanceof HTTPException) {
        return c.json(
          { error: true, message: err.message, data: {} },
          err.status
        );
      }

      console.error("Auth middleware error:", err);
      return res.error(c, "Internal server error in Auth middleware");
    }
  };
}

export function myError(c, err) {
  if (err instanceof HTTPException) {
    return c.json({ error: true, message: err.message, data: {} }, err.status);
  }

  console.error("Error handler:", err);
  return res.error(c, "Internal server error");
}

export const res = {
  ok: async (c, data, message) => c.json({ error: false, message, data }, 200),
  badRequest: async (c, message) =>
    c.json({ error: true, message, data: {} }, 400),
  unauthorized: async (c, message) =>
    c.json({ error: true, message, data: {} }, 401),
  forbidden: async (c, message) =>
    c.json({ error: true, message, data: {} }, 403),
  notFound: async (c, message) =>
    c.json({ error: true, message, data: {} }, 404),
  error: async (c, message) => c.json({ error: true, message, data: {} }, 500),
};
