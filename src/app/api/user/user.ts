// authors.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { res, createJwt } from "@/app/api/func";
import { userDb } from "./model/m.user";

const app = new Hono();

app.get("/all", async (c) => {
  return c.json(await userDb.getAllUsers());
});
app.post("/reg", async (c) => {
  try {
    const { name, email, password, dateOfBirth } = c.req.json();
    if (!name || !email || !password || !dateOfBirth) {
      throw new HTTPException(res.badRequest, {
        message: "Missing required fields",
      });
    }
    const user = await userDb.create({ name, email, dateOfBirth, password });
    await createJwt(c, {
      name: user.name,
      userName: user.userName,
      email: user.email,
      role: user.role,
    });

    return c.json(user, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }
    console.error("Error in user registration:", error);
    return c.json({ error: "Internal server error" }, res.error);
  }
});

app.get("/login", async (c) => {
  try {
    const { email, password } = c.req.json();
    if (!email || !password) {
      throw new HTTPException(res.badRequest, {
        message: "Missing required fields",
      });
    }

    const user = userDb.findUserByEmail(email);
    if (!user) {
      throw new HTTPException(res.badRequest, {
        message: "User not found",
      });
    }
    if (user.password !== password) {
      throw new HTTPException(res.badRequest, {
        message: "Invalid password",
      });
    }

    await createJwt(c, {
      name: user.name,
      userName: user.userName,
      email: user.email,
      role: user.role,
    });
    // Perform login logic here
    return c.json({ message: "Login successful" }, 200);
  } catch (error) {
    if (error instanceof HTTPException) {
      return c.json({ error: error.message }, error.status);
    }
    console.error("Error in user login:", error);
    return c.json({ error: "Internal server error" }, res.unauthorized);
  }
});

export default app;
