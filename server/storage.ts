import { users, type User, type InsertUser } from "@shared/schema";
import { supabase } from "./supabase";
import createMemoryStore from "memorystore";
import session from "express-session";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

// For Supabase connection using the drizzle ORM
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = sql ? drizzle(sql) : null;

// Define memory store for session
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

// The actual storage implementation will use Supabase
export class SupabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    // This implementation is just for compatibility with the interface
    // The actual Supabase authentication will be handled differently
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // This implementation is just for compatibility with the interface
    // The actual Supabase authentication will be handled differently
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // This implementation is just for compatibility with the interface
    // The actual Supabase authentication will be handled differently
    return { id: 0, ...insertUser };
  }
}

// Use memory storage for development, Supabase storage for production
export const storage = new MemStorage();
