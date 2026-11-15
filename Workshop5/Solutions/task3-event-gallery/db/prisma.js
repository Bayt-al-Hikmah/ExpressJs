import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
export default new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
