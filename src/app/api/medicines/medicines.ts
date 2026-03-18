import { Hono } from "hono";
import { medicinesDb } from "./model/m.medicines";
import { newsDb } from "./model/m.news";
import {
  authMiddleware,
  res,
  fileUploadHandler,
  deleteFile,
  myError,
} from "../func";

const app = new Hono();
const module: string = "medicine ";

app.get("/all-medicine", authMiddleware(false), async (c) => {
  try {
    const dbRes = await medicinesDb.find();
    return res.ok(c, dbRes, module + "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.get("/:id", authMiddleware(false), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await medicinesDb.findById(id);
    if (!dbRes) {
      return res.notFound(c, module + "not found");
    }
    return res.ok(c, dbRes, module + "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.post(
  "/add-medicine",
  authMiddleware(true, ["sudo", "admin", "lab"]),
  async (c) => {
    try {
      const body = await c.req.json();
      body.userRef = c.get("user")._id;
      const dbRes = await medicinesDb.create(body);
      return res.ok(c, dbRes, module + "created successfully");
    } catch (error) {
      myError(c, error);
    }
  },
);

app.put(
  "/update-medicine/:id",
  authMiddleware(true, ["sudo", "admin"]),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const dbRes = await medicinesDb.updateOne(id, body);
      if (!dbRes) {
        return res.notFound(c, module + "not found");
      }
      return res.ok(c, dbRes, module + "updated successfully");
    } catch (error) {
      myError(c, error);
    }
  },
);

app.get(
  "/all-news/checking",
  authMiddleware(true, ["sudo", "admin"]),
  async (c) => {
    try {
      const dbRes = await newsDb.find({ status: "checking" });
      if (!dbRes) {
        return res.notFound(c, "news " + "not found");
      }
      return res.ok(c, dbRes, "news " + "updated successfully");
    } catch (error) {
      myError(c, error);
    }
  },
);

app.get("/all-news/:id", authMiddleware(false), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await newsDb.find({ medicinesRef: id });
    if (!dbRes) {
      return res.notFound(c, "news " + "not found");
    }
    return res.ok(c, dbRes, "news " + "updated successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/news/:id", authMiddleware(false), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await newsDb.findById(id);
    if (!dbRes) {
      return res.notFound(c, "news " + "not found");
    }
    return res.ok(c, dbRes, "news " + "updated successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.delete("/news/:id", authMiddleware(true, ["sudo", "admin"]), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await newsDb.deleteOne(id);
    if (!dbRes) {
      return res.notFound(c, "news " + "not found");
    }
    return res.ok(c, dbRes, "news " + "deleted successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.post("/add-news", authMiddleware(false), async (c) => {
  try {
    const body = await c.req.json();
    body.userRef = c.get("user")._id;
    const dbRes = await newsDb.create(body);
    return res.ok(c, dbRes, "news " + "created successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.put(
  "/update-news/:id",
  authMiddleware(true, ["sudo", "admin"]),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const dbRes = await newsDb.updateOne(id, body);
      if (!dbRes) {
        return res.notFound(c, "news " + "not found");
      }
      return res.ok(c, dbRes, "news " + "updated successfully");
    } catch (error) {
      myError(c, error);
    }
  },
);

// app.get("/fileUpload", authMiddleware(false), async (c) => {
//   try {
//     const formData = c.req.formData();
//     const doc = formData.get("doc");
//     if (!doc) {
//       return res.badRequest(c, "No file uploaded");
//     }

//     // Assuming you have a function to handle file uploads
//     const fileUrl = await fileUploadHandler(doc, { numOfFiles: 1 });
//     if (!fileUrl.length) {
//       return res.notFound(c, "File upload failed");
//     }

//     return res.ok(c, { fileUrl }, "File uploaded successfully");
//   } catch (error) {
//     myError(c, error);
//   }
// });

export default app;
