// authors.ts
import { Hono } from "hono";
import {
  res,
  myError,
  authMiddleware,
  fileUploadHandler,
  deleteFile,
} from "@/app/api/func";
import { prescriptionsDb, problemsDb } from "./model/m.problems";

const app = new Hono();

app.get("/allProblemsOption", authMiddleware(true), async (c) => {
  return res.ok(
    c,
    await problemsDb.getAll({ ref: c.get("user")._id }),
    "Problems fetched successfully"
  );
});

app.get("/allProblems", authMiddleware(true), async (c) => {
  return res.ok(
    c,
    await problemsDb.getAll({ ref: c.get("user")._id }),
    "Problems fetched successfully"
  );
});

app.post("/addProblems", authMiddleware(true), async (c) => {
  try {
    const user = c.get("user");
    const formData = await c.req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const givenDoc = formData.getAll("givenDoc");
    if (!description || !title || !givenDoc) {
      return res.badRequest(c, "Missing required fields");
    }

    const links = await fileUploadHandler(givenDoc, {
      numOfFiles: 3,
    });
    if (links.length < 1) {
      return res.badRequest(c, "no valid files found");
    }

    const problems = await problemsDb.create({
      ref: user._id,
      title,
      description,
      givenDoc: links,
    });

    return res.ok(c, problems, "Problems added successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/:problem_id/getAllPrescriptions", authMiddleware(true), async (c) => {
  try {
    const user = c.get("user");
    const problemId = c.req.param("problem_id");
    const problem = await problemsDb.findOne({ _id: problemId, ref: user._id });
    if (!problem) {
      return res.notFound(c, "No problem found");
    }
    const prescriptions = await prescriptionsDb.getAll({ ref: problemId });

    return res.ok(c, prescriptions, "Prescriptions fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get(
  "/:problem_id/getPrescriptions/:id",
  authMiddleware(true),
  async (c) => {
    try {
      const user = c.get("user");
      const id = c.req.param("id");

      const prescriptions = await prescriptionsDb.findById(id);
      if (!prescriptions) {
        return res.notFound(c, "No prescriptions found");
      }
      if (prescriptions.ref.toString() !== user._id.toString()) {
        return res.forbidden(c, "You are not authorized to view this");
      }
      return res.ok(c, prescriptions, "Prescriptions fetched successfully");
    } catch (error) {
      myError(c, error);
    }
  }
);

app.post("/:problem_id/addPrescriptions", authMiddleware(true), async (c) => {
  let links = [];
  try {
    const user = c.get("user");
    const problemId = c.req.param("problem_id");
    const problem = await problemsDb.findOne({ _id: problemId, ref: user._id });
    if (!problem) {
      return res.notFound(c, "No problem found");
    }
    const formData = await c.req.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const medication = JSON.parse(formData.getAll("medication"));
    const givenDoc = formData.getAll("givenDoc");

    if (!description || !title || !givenDoc || !medication) {
      return res.badRequest(c, "Missing required fields");
    }

    links = await fileUploadHandler(givenDoc, {
      numOfFiles: 3,
    });
    if (links.length < 1) {
      return res.badRequest(c, "no valid files found");
    }
    console.log(import.meta.url + " : ", links);
    // return res.badRequest(c, "no valid files found");
    const prescriptions = await prescriptionsDb.create({
      ref: problemId,
      title,
      description,
      medication: medication || [],
      givenDoc: links,
      addedBy: user._id,
    });

    return res.ok(c, prescriptions, "Prescriptions added successfully");
  } catch (error) {
    if (links.length > 0) {
      links.forEach((link) => {
        deleteFile(link);
      });
    }
    myError(c, error);
  }
});

// app.post("/upload", authMiddleware(true), async (c) => {
//   try {
//     const user = c.get("user");
//     const { description } = await c.req.json();

//     if (!description) {
//       return res.badRequest(c, "Missing required fields");
//     }

//     const files = c.req.files("givenDoc");

//     if (!files || files.length === 0) {
//       return res.badRequest(c, "No files uploaded");
//     }

//     const prescriptions = await prescriptionsDb.create({
//       description,
//       ref: user._id,
//       by: user._id,
//       givenDoc: files.map((file) => file.path),
//     });

//     return res.ok(c, prescriptions, "Prescriptions added successfully");
//   } catch (error) {
//     myError(c, error);
//   }
// });

// app.delete("/deletePrescriptions/:id", authMiddleware(true), async (c) => {
//   try {
//     const user = c.get("user");
//     const id = c.req.param("id");

//     const prescriptions = await prescriptionsDb.findById(id);
//     if (!prescriptions) {
//       return res.notFound(c, "No prescriptions found");
//     }

//     await deleteFile(prescriptions.givenDoc);

//     await prescriptionsDb.delete(id);

//     return res.ok(c, {}, "Prescriptions deleted successfully");
//   } catch (error) {
//     myError(c, error);
//   }
// });

export default app;
