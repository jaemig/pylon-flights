import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const humansTable = sqliteTable("humans", {
    id: int().primaryKey({ autoIncrement: true }),
    firstname: text({ length: 255 }).notNull(),
    lastname: text({ length: 255 }).notNull(),
    birthdate: text({ length: 10 }).notNull(), // YYYY-MM-DD
})