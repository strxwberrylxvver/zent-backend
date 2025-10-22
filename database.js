//  Imports --------------------------------
import mysql from "mysql2/promise";

//  Database Connection --------------------

const dbConfig = {
  database: process.env.DB_NAME || "Zent",
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_ROOT || "root",
  password: process.env.DB_PASS || "",
  namedPlaceholders: true,
};

let database = null;

try {
  database = await mysql.createConnection(dbConfig);
} catch (error) {
  console.log("Error creating Database Connection: " + error.message);
  process.exit;
}
export default database;
