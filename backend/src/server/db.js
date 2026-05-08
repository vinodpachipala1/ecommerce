import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new Pool({
    
    connectionString: process.env.dbString,
})

export default db;