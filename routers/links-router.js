import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import database from "../database.js";
import Model from "../models/Model.js";
import Accessor from "../accessors/Accessor.js";
import userLinksModel from "../models/userlinks-model.js";

const linksRouter = Router();
const accessor = new Accessor(new Model(userLinksModel), database);

linksRouter.get("/my-students", async (req, res) => {
  const { isSuccess, result, message } = await accessor.read(req.user.userID, "by_linker");
  if (!isSuccess) return res.status(404).json({ message });
  res.status(200).json(result);
});

linksRouter.post("/", async (req, res) => {
  const { studentEmail, linkType } = req.body;
  if (!studentEmail || !linkType)
    return res.status(400).json({ message: "studentEmail and linkType are required." });

  const [rows] = await database.query(
    "SELECT UserID, FirstName, LastName, UserType FROM users WHERE Email = :email AND UserType = 'Student'",
    { email: studentEmail }
  );
  if (!rows.length)
    return res.status(404).json({ message: "No student found with that email." });

  const student = rows[0];
  const record = {
    LinkID: uuidv4(),
    LinkedByID: req.user.userID,
    StudentID: student.UserID,
    LinkType: linkType,
  };

  const { isSuccess, message } = await accessor.create(record);
  if (!isSuccess) return res.status(500).json({ message });

  res.status(201).json({ message: "Student linked successfully.", student });
});

linksRouter.delete("/:id", async (req, res) => {
  const { isSuccess, message } = await accessor.delete(req.params.id);
  if (!isSuccess) return res.status(404).json({ message });
  res.status(200).json({ message: "Link removed." });
});

export default linksRouter;