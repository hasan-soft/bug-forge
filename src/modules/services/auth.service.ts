import bcrypt from "bcrypt";
import { pool } from "../../db";

interface TUserSignup {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

const createUserIntoDB = async (payload: TUserSignup) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  const userRole = role || "contributor";

  const query = `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at;
    `;
  const values = [name, email, hashedPassword, userRole];
  const result = await pool.query(query, values);
  return result;
};
const loginUserFromDB = async (email: string) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await pool.query(query, [email]);
  return result;
};
export const userService = {
  createUserIntoDB,
  loginUserFromDB,
};
