import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Use environment variables for database connection
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  database: process.env.DB_NAME || "devuser_qoupled_upgrade",
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || '3306'
});

export const db = drizzle(connection);
