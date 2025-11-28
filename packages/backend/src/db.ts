import fs from "fs";
import path from "path";
import { Pool } from "pg";
import "./env-config";

export const db = new Pool();

const initSQL = fs.readFileSync(path.resolve(process.cwd(), "src/sql/db.sql"), "utf-8");
db.query(initSQL);
