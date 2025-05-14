// authors.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  res,
  createJwt,
  myError,
  logout,
  authMiddleware,
} from "@/app/api/func";
import { userDb } from "./model/m.user";

const app = new Hono();

app.get("/all", async (c) => {
  return c.json(await userDb.getAllUsers());
});
app.post("/reg", async (c) => {
  try {
    // const body = await c.req.parseBody({ dot: true });
    const { name, email, password, dateOfBirth, gender } = await c.req.json();

    if (!name || !email || !password || !dateOfBirth || !gender) {
      return res.badRequest(c, "Missing required fields");
    }
    const user = await userDb.create({
      name,
      email,
      dateOfBirth,
      gender,
      password,
    });
    await createJwt(c, {
      _id: user._id,
      name: user.name,
      userName: user.userName,
      email: user.email,
      role: user.role,
    });

    return res.ok(c, user, "User created successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.post("/login", async (c) => {
  try {
    const { identifier, password } = await c.req.json();
    if (!identifier || !password) {
      return res.badRequest(c, "Missing required fields");
    }

    const user = await userDb.getLoginUser({
      $or: [
        { email: identifier },
        { userName: identifier },
        { phone: identifier },
      ],
    });
    if (!user) {
      return res.notFound(c, "User not found");
    }
    if (user.password !== password) {
      return res.badRequest(c, "Invalid password");
    }

    const jwtData = {
      _id: user._id,
      name: user.name,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };

    await createJwt(c, jwtData);
    // Perform login logic here
    return res.ok(c, jwtData, "User logged in successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/verify", authMiddleware(true), async (c) => {
  try {
    return res.ok(c, c.get("user"), "User verified successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/profile", authMiddleware(true), async (c) => {
  try {
    const user = await userDb.findById(c.get("user")._id);
    user.password = undefined; // Remove password from response
    return res.ok(c, user, "User verified successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/logout", async (c) => {
  try {
    await logout(c);
    return res.ok(c, {}, "User logged out successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
