import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const visitors = sqliteTable("visitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  visitorKey: text("visitor_key").notNull(),
  wishAshley: text("wish_ashley"),
  wishSelf: text("wish_self"),
  createdAt: text("created_at").notNull().default(""),
}, (table) => [uniqueIndex("idx_visitors_visitor_key").on(table.visitorKey)]);
