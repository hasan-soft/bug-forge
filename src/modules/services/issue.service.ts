import { pool } from "../../db/index.js";
import type {
  CreateIssuePayload,
  IssueQuery,
  IssueRow,
  UpdateIssuePayload,
  UserRow,
} from "../../types/index.js";
import type { QueryResult } from "pg";


const getReportersByIds = async (
  ids: number[],
): Promise<Pick<UserRow, "id" | "name" | "role">[]> => {
  if (ids.length === 0) return [];
  const result = await pool.query<Pick<UserRow, "id" | "name" | "role">>(
    "SELECT id, name, role FROM users WHERE id = ANY($1);",
    [ids],
  );
  return result.rows;
};

export const attachReporters = async (issues: IssueRow[]) => {
  const uniqueIds = [...new Set(issues.map((i) => i.reporter_id))];
  const reporters = await getReportersByIds(uniqueIds);
  const reporterMap = new Map(reporters.map((r) => [r.id, r]));

  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: reporterMap.get(reporter_id) ?? null,
  }));
};

// ─── CRUD 

const createIssue = async (
  payload: CreateIssuePayload,
  reporterId: number,
): Promise<QueryResult<IssueRow>> => {
  const { title, description, type } = payload;
  return pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *;`,
    [title, description, type, reporterId],
  );
};

const getAllIssues = async (filters: IssueQuery) => {
  const { sort = "newest", type, status } = filters;

  const conditions: string[] = [];
  const values: string[] = [];
  let i = 1;

  if (type) {
    conditions.push(`type = $${i++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${i++}`);
    values.push(status);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query<IssueRow>(
    `SELECT * FROM issues ${where} ORDER BY created_at ${order};`,
    values,
  );
  return attachReporters(result.rows);
};

const getIssueById = async (id: number): Promise<QueryResult<IssueRow>> => {
  return pool.query<IssueRow>("SELECT * FROM issues WHERE id = $1;", [id]);
};

const updateIssue = async (
  id: number,
  payload: UpdateIssuePayload,
): Promise<QueryResult<IssueRow>> => {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  let i = 1;

  if (payload.title !== undefined) {
    fields.push(`title = $${i++}`);
    values.push(payload.title);
  }
  if (payload.description !== undefined) {
    fields.push(`description = $${i++}`);
    values.push(payload.description);
  }
  if (payload.type !== undefined) {
    fields.push(`type = $${i++}`);
    values.push(payload.type);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  return pool.query<IssueRow>(
    `UPDATE issues SET ${fields.join(", ")} WHERE id = $${i} RETURNING *;`,
    values,
  );
};

const deleteIssue = async (id: number): Promise<QueryResult<IssueRow>> => {
  return pool.query<IssueRow>(
    "DELETE FROM issues WHERE id = $1 RETURNING id;",
    [id],
  );
};

export const issueService = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  attachReporters,
};
