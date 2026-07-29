import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminSessions = sqliteTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  adminId: text("admin_id").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cmsProducts = sqliteTable("cms_products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  sizes: text("sizes").notNull(),
  status: text("status", { enum: ["active", "draft", "out_of_stock"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const cmsProductImages = sqliteTable("cms_product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => cmsProducts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  objectKey: text("object_key"),
  position: integer("position").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
