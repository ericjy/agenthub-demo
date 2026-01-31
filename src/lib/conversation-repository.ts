/**
 * Persistent store for conversation registry items using libSQL.
 * - Local development: SQLite file at data/conversations.db
 * - Production: Turso remote database
 *
 * Why do we need this store if we are using the managed Conversations API?
 * Because Conversations API does not have the concept of end user and the capability to list all conversations for an end user.
 * This layer is responsible for storing the mapping of conversation IDs to user IDs, and the retrieval of conversations for a user.
 * This layer may be used to store other metadata about the conversation, such as summarized conversation name, etc.
 */
import { createClient, Client } from '@libsql/client';
import { mkdirSync } from 'fs';
import { join } from 'path';

export interface Conversation {
  id: string;
  userId: string;
  createdAt: number;
  title?: string;
}

// Dual-mode client: SQLite locally, Turso in production
const isProduction = process.env.NODE_ENV === 'production';

function createDbClient(): Client {

  // Production mode: use Turso
  if (!isProduction) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // Local mode: use SQLite file in data directory
  const dataDir = join(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });
  return createClient({
    url: 'file:data/conversations.db',
  });
}

const db: Client = createDbClient();

// Initialize the database schema
async function initializeSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      title TEXT
    )
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_user_id ON conversations(user_id)
  `);
}

// Initialize schema on module load
const schemaInitialized = initializeSchema().catch((err) => {
  console.error('Failed to initialize conversation database schema:', err);
});

/**
 * Ensures the schema is initialized before any database operation.
 */
async function ensureSchema() {
  await schemaInitialized;
}

/**
 * Repository for conversation CRUD operations.
 */
export const conversationRepository = {
  /**
   * Find all conversations, optionally filtered by userId.
   */
  async findAll(userId?: string): Promise<Conversation[]> {
    await ensureSchema();

    const result = userId
      ? await db.execute({
          sql: 'SELECT id, user_id, created_at, title FROM conversations WHERE user_id = ? ORDER BY created_at DESC',
          args: [userId],
        })
      : await db.execute('SELECT id, user_id, created_at, title FROM conversations ORDER BY created_at DESC');

    return result.rows.map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      createdAt: row.created_at as number,
      title: row.title as string | undefined,
    }));
  },

  /**
   * Find a conversation by ID.
   */
  async findById(id: string): Promise<Conversation | undefined> {
    await ensureSchema();

    const result = await db.execute({
      sql: 'SELECT id, user_id, created_at, title FROM conversations WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return undefined;
    }

    const row = result.rows[0];
    return {
      id: row.id as string,
      userId: row.user_id as string,
      createdAt: row.created_at as number,
      title: row.title as string | undefined,
    };
  },

  /**
   * Save a conversation (insert or update).
   */
  async save(conversation: Conversation): Promise<void> {
    await ensureSchema();

    await db.execute({
      sql: `
        INSERT INTO conversations (id, user_id, created_at, title)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          created_at = excluded.created_at,
          title = COALESCE(excluded.title, conversations.title)
      `,
      args: [conversation.id, conversation.userId, conversation.createdAt, conversation.title ?? null],
    });
  },

  /**
   * Update only the title of a conversation.
   */
  async updateTitle(id: string, title: string): Promise<boolean> {
    await ensureSchema();

    const result = await db.execute({
      sql: 'UPDATE conversations SET title = ? WHERE id = ?',
      args: [title, id],
    });

    return result.rowsAffected > 0;
  },
};
