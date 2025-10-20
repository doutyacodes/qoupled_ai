import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Use environment variables for database connection
const connection = await mysql.createConnection({
  host: "68.178.163.247",
  user: "devuser_qoupled_upgrade",
  database: "devuser_qoupled_upgrade",
  password:'Wowfy#user',
  port:'3306'
});
export const db = drizzle(connection);

