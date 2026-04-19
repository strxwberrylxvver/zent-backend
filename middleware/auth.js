import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided." });

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authenticate;