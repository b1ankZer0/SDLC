import { Hono } from "hono";
import { userDb } from "./model/m.user";
import {
  authMiddleware,
  res,
  fileUploadHandler,
  deleteFile,
  myError,
} from "../func";

const app = new Hono();

app.get("/all-", authMiddleware(false), async (c) => {
  try {
    const users = await userDb.find();
    return res.ok(c, users, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.get("/:id", authMiddleware(false), async (c) => {
  try {
    const id = c.req.param("id");
    const user = await userDb.findById(id);
    if (!user) {
      return res.notFound(c, "User not found");
    }
    return res.ok(c, user, "User fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.post("/add-", authMiddleware(false), async (c) => {
  try {
    const body = await c.req.json();
    const user = await userDb.create(body);
    return res.created(c, user, "User created successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.get("/fileUplode", authMiddleware(false), async (c) => {
  try {
    const formData = c.req.formData();
    const doc = formData.get("doc");
    if (!doc) {
      return res.badRequest(c, "No file uploaded");
    }

    // Assuming you have a function to handle file uploads
    const fileUrl = await fileUploadHandler(doc, { numOfFiles: 1 });
    if (!fileUrl.length) {
      return res.notFound(c, "File upload failed");
    }

    return res.ok(c, { fileUrl }, "File uploaded successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
