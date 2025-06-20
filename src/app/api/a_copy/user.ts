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
const module = "user ";

app.get("/all-", authMiddleware(false), async (c) => {
  try {
    const dbRes = await userDb.find();
    return res.ok(c, dbRes, module + "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.get("/:id", authMiddleware(false), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await userDb.findById(id);
    if (!dbRes) {
      return res.notFound(c, module + "not found");
    }
    return res.ok(c, dbRes, module + "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.post("/add-", authMiddleware(false), async (c) => {
  try {
    const body = await c.req.json();
    const dbRes = await userDb.create(body);
    return res.created(c, dbRes, module + "created successfully");
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
