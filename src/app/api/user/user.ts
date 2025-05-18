import { Hono } from "hono";
import {
  res,
  createJwt,
  myError,
  logout,
  authMiddleware,
  fileUploadHandler,
  deleteFile,
} from "@/app/api/func";
import { userDb, roleReqDb } from "./model/m.user";
import bcrypt from "bcrypt";

const app = new Hono();
const SALT_ROUNDS = 10; // Recommended salt rounds for bcrypt

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

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userDb.create({
      name,
      email,
      dateOfBirth,
      gender,
      password: hashedPassword,
    });
    await createJwt(c, user);

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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.badRequest(c, "Invalid password");
    }

    await createJwt(c, user);
    user.password = undefined; // Remove password from response
    // Perform login logic here
    return res.ok(c, user, "User logged in successfully");
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

app.patch("/profile", authMiddleware(true), async (c) => {
  const user = c.get("user"); // make sure authMiddleware sets this
  const userId = user._id; // make sure authMiddleware sets this

  const contentType = c.req.header("Content-Type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return res.badRequest(c, "Content-Type must be multipart/form-data");
  }

  const formData = await c.req.formData();

  const updateData: Record<string, any> = {
    name: formData.get("name"),
    email: formData.get("email"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  };

  // Handle logo file
  const logoFile = formData.get("logo");
  if (logoFile) {
    const links = await fileUploadHandler(logoFile, { numOfFiles: 1 });
    const oldUser = await userDb.findById(userId);
    deleteFile(oldUser.logo);
    if (links.length > 0) {
      updateData.logo = links[0];
    }
  }
  const updatedUser = await userDb.updateUser(userId, updateData);

  return res.ok(c, updatedUser, "Profile updated");
});

app.get("/logout", async (c) => {
  try {
    await logout(c);
    return res.ok(c, {}, "User logged out successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.post("/addRoleReq", authMiddleware(true), async (c) => {
  try {
    const _id = c.get("user")._id;
    const user = await userDb.findById(_id);
    if (user.role !== "user" || user.address == "Not provided" || !user.phone) {
      return res.badRequest(
        c,
        "You already have a role or plz update user info"
      );
    }

    const oldReq = await roleReqDb.findOne({ ref: _id });
    if (oldReq) {
      return res.badRequest(c, "You already have a role request");
    }

    const body = await c.req.formData();
    const role = body.get("role");
    const givenDoc = body.get("givenDoc");
    const description = body.get("description");
    console.log(import.meta.url + " : ", givenDoc);
    if (!role || !givenDoc) {
      return res.badRequest(c, "Missing required fields");
    }

    const links = await fileUploadHandler(givenDoc, {
      numOfFiles: 5,
    });
    if (links.length < 1) {
      return res.badRequest(c, "no valid files found");
    }
    const roleReq = await roleReqDb.create({
      ref: _id,
      role,
      givenDoc: links,
      description,
    });

    return res.ok(c, roleReq, "Role fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
