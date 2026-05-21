import pg from "pg";
import { config } from "../config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.database_url,
});

export const initDB = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
