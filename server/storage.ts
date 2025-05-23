import { 
  users,
  profiles, 
  documents,
  requests,
  type User,
  type InsertUser,
  type Request,
  type InsertRequest,
  type UpdateRequest
} from "@shared/schema";
import session from "express-session";
import createMemoryStoreLib from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { eq, and, or, sql } from "drizzle-orm";
import db from "./db";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  
  // Request operations
  getAllRequests(): Promise<Request[]>;
  getRequestsByUserId(userId: number): Promise<Request[]>;
  createRequest(request: Omit<Request, "id">): Promise<Request>;
  updateRequest(id: number, request: Partial<Request>): Promise<Request | undefined>;
  getActiveRequestsCount(userId: number): Promise<number>;
  
  // Session store
  sessionStore: session.Store;

  getAllUsers(): Promise<User[]>;

  getAllUsersWithProfiles(): Promise<any[]>;
}

// In-memory storage implementation (for testing/development)
const MemoryStore = createMemoryStoreLib(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private requests: Map<number, Request>;
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.requests = new Map();
    this.currentId = 1;
    this.sessionStore = new session.MemoryStore();
  }

  // User methods
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
    const createdAt = new Date();
    const updatedAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      updatedAt,
      role: insertUser.role || 'estudiante' 
    };
    this.users.set(id, user);
    return user;
  }

  // Request methods
  async getAllRequests(): Promise<Request[]> {
    return Array.from(this.requests.values());
  }

  async getRequestsByUserId(userId: number): Promise<Request[]> {
    return Array.from(this.requests.values()).filter(
      (request) => request.userId === userId
    );
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const id = this.currentId++;
    const createdAt = new Date();
    const request: Request = {
      ...insertRequest,
      id,
      createdAt,
      status: 'pendiente',
      response: null,
      updatedAt: null,
      respondedAt: null,
      respondedBy: null
    };
    this.requests.set(id, request);
    return request;
  }

  async updateRequest(id: number, updateData: Partial<Request>): Promise<Request | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;

    const updatedRequest = {
      ...request,
      ...updateData,
      updatedAt: new Date()
    };
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getActiveRequestsCount(userId: number): Promise<number> {
    return Array.from(this.requests.values()).filter(
      (request) => 
        request.userId === userId && 
        (request.status === 'pendiente' || request.status === 'en_proceso')
    ).length;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllUsersWithProfiles(): Promise<any[]> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        fullName: profiles.fullName,
        profileEmail: profiles.email,
        documentType: profiles.documentType,
        documentNumber: profiles.documentNumber
      })
      .from(users)
      .leftJoin(profiles, sql`${users.id} = ${profiles.userId}`);
    return result;
  }
}

// Database storage implementation
const PgSessionStore = connectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSessionStore({
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || 'estudiante'
      })
      .returning();
    return user;
  }

  // Request methods
  async getAllRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(requests.createdAt);
  }

  async getRequestsByUserId(userId: number): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.userId, userId));
  }

  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const [request] = await db
      .insert(requests)
      .values(insertRequest)
      .returning();
    return request;
  }

  async updateRequest(id: number, updateData: Partial<Request>): Promise<Request | undefined> {
    const [request] = await db
      .update(requests)
      .set(updateData)
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  async getActiveRequestsCount(userId: number): Promise<number> {
    const activeRequests = await db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.userId, userId),
          or(
            eq(requests.status, 'pendiente'),
            eq(requests.status, 'en_proceso')
          )
        )
      );
    return activeRequests.length;
  }

  async getAllStudentsWithDocuments() {
    const studentsWithDocs = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: profiles.fullName,
        documentNumber: profiles.documentNumber,
        document: documents,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(documents, eq(users.id, documents.userId))
      .where(eq(users.role, 'student'));

    // Agrupar documentos por estudiante
    const studentsMap = new Map();
    
    for (const row of studentsWithDocs) {
      const { document: doc, ...student } = row;
      
      if (!studentsMap.has(student.id)) {
        studentsMap.set(student.id, {
          ...student,
          documents: doc ? [doc] : []
        });
      } else if (doc) {
        studentsMap.get(student.id).documents.push(doc);
      }
    }

    return Array.from(studentsMap.values());
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsersWithProfiles(): Promise<any[]> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        fullName: profiles.fullName,
        profileEmail: profiles.email,
        documentType: profiles.documentType,
        documentNumber: profiles.documentNumber
      })
      .from(users)
      .leftJoin(profiles, sql`${users.id} = ${profiles.userId}`);
    return result;
  }
}

// Export the database storage instance
export const storage = new DatabaseStorage();
