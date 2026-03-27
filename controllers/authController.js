import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const SALT_ROUNDS = 10;

class AuthController {
  constructor(accessor) {
    this.accessor = accessor;
  }

  register = async (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    if (!firstName || !email || !password)
      return res
        .status(400)
        .json({ message: "First name, email and password are required." });

    const existing = await this.accessor.read(email, "email");
    if (existing.isSuccess)
      return res.status(409).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const record = {
      UserID: uuidv4(),
      FirstName: firstName,
      LastName: lastName || null,
      Email: email,
      PasswordHash: hashedPassword,
      UserType: userType || "Student",
    };

    const { isSuccess, message } = await this.accessor.create(record);
    if (!isSuccess) return res.status(500).json({ message });

    res.status(201).json({ message: "User registered successfully." });
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const { isSuccess, result } = await this.accessor.read(email, "email");
    if (!isSuccess)
      return res.status(401).json({ message: "Invalid email or password." });

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid email or password." });


    const token = jwt.sign(
      { userID: user.UserID, email: user.Email, firstName: user.FirstName, userType: user.UserType },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(200).json({
      token,
      userID: user.UserID,
      email: user.Email,
      firstName: user.FirstName,
      userType: user.UserType,
    });
  };
}

export default AuthController;