import mysql from "mysql2/promise";

const dbConfig = {
  database: process.env.DB_NAME || "Zent",
  port:     process.env.DB_PORT || 3306,
  host:     process.env.DB_HOST || "localhost",
  user:     process.env.DB_ROOT || "root",
  password: process.env.DB_PASS || "",
  namedPlaceholders: true,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
};

const database = mysql.createPool(dbConfig);

try {
  const conn = await database.getConnection();
  console.log("Connected to DB:", dbConfig.database, "on", dbConfig.host, ":", dbConfig.port);
  conn.release();
} catch (error) {
  console.log("Error connecting to database:", error.message);
  process.exit(1);
}

export default database;