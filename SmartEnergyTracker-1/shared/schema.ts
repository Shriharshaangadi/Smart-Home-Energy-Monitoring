import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // refrigerator, tv, washer, etc.
  status: text("status").notNull(), // active, standby, offline
  currentPower: real("current_power").notNull(),
  todayUsage: real("today_usage").notNull(),
  isHighPower: boolean("is_high_power").default(false),
  icon: text("icon").notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  userId: true,
  name: true,
  location: true,
  type: true,
  status: true,
  currentPower: true,
  todayUsage: true,
  isHighPower: true,
  icon: true,
});

export const energyUsage = pgTable("energy_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  power: real("power").notNull(),
  dailyTotal: real("daily_total").notNull(),
  monthlyCost: real("monthly_cost").notNull(),
  carbonFootprint: real("carbon_footprint").notNull(),
});

export const insertEnergyUsageSchema = createInsertSchema(energyUsage).pick({
  userId: true,
  timestamp: true,
  power: true,
  dailyTotal: true,
  monthlyCost: true,
  carbonFootprint: true,
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  dailyKwh: real("daily_kwh").notNull(),
  monthlyBudget: real("monthly_budget").notNull(),
  carbonTarget: real("carbon_target").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  dailyKwh: true,
  monthlyBudget: true,
  carbonTarget: true,
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  type: text("type").notNull(), // info, warning, error, success
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  userId: true,
  timestamp: true,
  type: true,
  title: true,
  message: true,
  read: true,
});

// Historical energy data by timeframe
export const energyHistory = pgTable("energy_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  hourlyData: jsonb("hourly_data").notNull(), // Array of 24 hourly readings
  totalKwh: real("total_kwh").notNull(),
  averageKwh: real("average_kwh").notNull(),
});

export const insertEnergyHistorySchema = createInsertSchema(energyHistory).pick({
  userId: true,
  date: true,
  hourlyData: true,
  totalKwh: true,
  averageKwh: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type EnergyUsage = typeof energyUsage.$inferSelect;
export type InsertEnergyUsage = z.infer<typeof insertEnergyUsageSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type EnergyHistory = typeof energyHistory.$inferSelect;
export type InsertEnergyHistory = z.infer<typeof insertEnergyHistorySchema>;
