import { error } from "console";
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
  } catch (error) {
    console.error("Error creating JWT:", error);
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
    } catch (error) {
      if (error instanceof HTTPException) {
        return c.json({ error: error.message }, error.status);
      }

      console.error("Auth middleware error:", error);
      return c.json({ error: "Authentication error" }, 500);
    }
  };
}

export function error(c, error) {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  console.error("Error handler:", error);
  return c.json({ error: "Internal server error" }, 500);
}

export const res = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  error: 500,
};
