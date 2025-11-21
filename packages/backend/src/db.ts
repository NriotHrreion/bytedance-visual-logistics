import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const db = new Pool();

const initSQL = fs.readFileSync(path.resolve(process.cwd(), "src/sql/db.sql"), "utf-8");
db.query(initSQL);
