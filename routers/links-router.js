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
  if (!isSuccess) return res.status(500).json({ message });
  res.status(200).json(result); // always returns array, even if empty
});

linksRouter.post("/", async (req, res) => {
  const { studentEmail, linkType } = req.body;
  if (!studentEmail || !linkType)
    return res.status(400).json({ message: "studentEmail and linkType are required." });

  try {
    const [users] = await database.query(
      "SELECT UserID, FirstName, LastName FROM users WHERE Email = :email AND UserType = 'Student'",
      { email: studentEmail }
    );
    if (!users.length)
      return res.status(404).json({ message: "No student found with that email." });

    const student = users[0];

    const [existing] = await database.query(
      "SELECT LinkID FROM userlinks WHERE LinkedByID = :linkedBy AND StudentID = :studentID AND LinkType = :linkType",
      { linkedBy: req.user.userID, studentID: student.UserID, linkType }
    );
    if (existing.length)
      return res.status(409).json({ message: "This student is already linked to your account." });

    await database.query(
      "INSERT INTO userlinks (LinkID, LinkedByID, StudentID, LinkType) VALUES (:linkID, :linkedBy, :studentID, :linkType)",
      { linkID: uuidv4(), linkedBy: req.user.userID, studentID: student.UserID, linkType }
    );

    res.status(201).json({ message: "Student linked successfully.", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

linksRouter.delete("/:id", async (req, res) => {
  try {
    await database.query(
      "DELETE FROM userlinks WHERE LinkID = :id AND LinkedByID = :linkedBy",
      { id: req.params.id, linkedBy: req.user.userID }
    );
    res.status(200).json({ message: "Link removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default linksRouter;