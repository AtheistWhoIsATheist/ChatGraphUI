import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { corpusNodes, corpusLinks } from '../data/corpus.ts';

dotenv.config();

let db: any;

export async function connectDB() {
  try {
    db = new Database('voidgraph.db');
    
    // Initialize tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        label TEXT,
        type TEXT,
        status TEXT,
        summary TEXT,
        blocks TEXT,
        socratic_questions TEXT,
        metadata TEXT,
        saturation_level INTEGER,
        revision_count INTEGER,
        last_audited_date TEXT,
        audit_logs TEXT
      );
      
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT,
        target TEXT,
        label TEXT,
        type TEXT
      );
      
      CREATE TABLE IF NOT EXISTS digests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        content TEXT,
        type TEXT
      );
    `);
    
    // Seed data if empty
    const count = db.prepare('SELECT COUNT(*) as count FROM nodes').get().count;
    if (count === 0) {
      console.log('[DB] Seeding initial corpus nodes and links...');
      const insertNode = db.prepare(`
        INSERT OR IGNORE INTO nodes (
          id, label, type, status, summary, blocks, socratic_questions,
          metadata, saturation_level, revision_count, last_audited_date, audit_logs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const insertManyNodes = db.transaction((nodes: any[]) => {
        for (const node of nodes) {
          insertNode.run(
            node.id,
            node.label,
            node.type,
            node.status || 'UNKNOWN',
            node.summary || '',
            JSON.stringify(node.blocks || []),
            JSON.stringify(node.socratic_questions || []),
            JSON.stringify(node.metadata || {}),
            node.saturation_level || 0,
            node.revision_count || 0,
            node.last_audited_date ? new Date(node.last_audited_date).toISOString() : new Date().toISOString(),
            JSON.stringify(node.audit_logs || [])
          );
        }
      });
      
      insertManyNodes(corpusNodes);

      const insertLink = db.prepare(`
        INSERT INTO links (source, target, label, type) VALUES (?, ?, ?, ?)
      `);

      const insertManyLinks = db.transaction((links: any[]) => {
        for (const link of links) {
          insertLink.run(
            typeof link.source === 'string' ? link.source : (link.source as any).id,
            typeof link.target === 'string' ? link.target : (link.target as any).id,
            link.label || '',
            link.type || ''
          );
        }
      });

      insertManyLinks(corpusLinks);

      console.log('[DB] Seeding complete.');
    }
    
    console.log('[DB] Connected to SQLite - The Abyssal Archive is online.');
  } catch (error) {
    console.error('[DB] Failed to connect to SQLite:', error);
  }
}

export function getDb() {
  return db;
}

export function getNodesCollection() {
  if (!db) return null;
  
  return {
    insertOne: async (node: any) => {
      const stmt = db.prepare(`
        INSERT INTO nodes (
          id, label, type, status, summary, blocks, socratic_questions,
          metadata, saturation_level, revision_count, last_audited_date, audit_logs
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        node.id,
        node.label,
        node.type,
        node.status,
        node.summary,
        JSON.stringify(node.blocks || []),
        JSON.stringify(node.socratic_questions || []),
        JSON.stringify(node.metadata || {}),
        node.saturation_level || 0,
        node.revision_count || 0,
        node.last_audited_date ? new Date(node.last_audited_date).toISOString() : new Date().toISOString(),
        JSON.stringify(node.audit_logs || [])
      );
      return { insertedId: node.id };
    },
    updateOne: async (filter: any, update: any) => {
      // Basic implementation for the cron job's updateOne
      const id = filter._id || filter.id;
      
      const row = db.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
      if (!row) return { modifiedCount: 0 };
      
      let summary = row.summary;
      let socratic_questions = JSON.parse(row.socratic_questions || '[]');
      let saturation_level = row.saturation_level;
      let last_audited_date = row.last_audited_date;
      let audit_logs = JSON.parse(row.audit_logs || '[]');
      let revision_count = row.revision_count;
      let metadata = JSON.parse(row.metadata || '{}');
      
      if (update.$set) {
        if (update.$set.summary !== undefined) summary = update.$set.summary;
        if (update.$set.socratic_questions !== undefined) socratic_questions = update.$set.socratic_questions;
        if (update.$set.saturation_level !== undefined) saturation_level = update.$set.saturation_level;
        if (update.$set.last_audited_date !== undefined) last_audited_date = new Date(update.$set.last_audited_date).toISOString();
        if (update.$set.metadata !== undefined) metadata = { ...metadata, ...update.$set.metadata };
      }
      
      if (update.$push && update.$push.audit_logs) {
        audit_logs.push(update.$push.audit_logs);
      }
      
      if (update.$inc && update.$inc.revision_count) {
        revision_count += update.$inc.revision_count;
      }
      
      const stmt = db.prepare(`
        UPDATE nodes SET
          summary = ?,
          socratic_questions = ?,
          saturation_level = ?,
          last_audited_date = ?,
          audit_logs = ?,
          revision_count = ?,
          metadata = ?
        WHERE id = ?
      `);
      
      stmt.run(
        summary,
        JSON.stringify(socratic_questions),
        saturation_level,
        last_audited_date,
        JSON.stringify(audit_logs),
        revision_count,
        JSON.stringify(metadata),
        id
      );
      
      return { modifiedCount: 1 };
    }
  };
}

export function getDigestsCollection() {
  if (!db) return null;
  
  return {
    insertOne: async (digest: any) => {
      const stmt = db.prepare(`
        INSERT INTO digests (date, content, type) VALUES (?, ?, ?)
      `);
      const info = stmt.run(
        digest.date ? new Date(digest.date).toISOString() : new Date().toISOString(),
        digest.content,
        digest.type
      );
      return { insertedId: info.lastInsertRowid };
    }
  };
}

export async function getNodesForDensification() {
  if (!db) return [];
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const rows = db.prepare(`
    SELECT * FROM nodes 
    WHERE saturation_level < 100 OR last_audited_date < ?
    ORDER BY saturation_level ASC, last_audited_date ASC
    LIMIT 10
  `).all(sevenDaysAgo);
  
  return rows.map((row: any) => ({
    ...row,
    _id: row.id,
    blocks: JSON.parse(row.blocks || '[]'),
    socratic_questions: JSON.parse(row.socratic_questions || '[]'),
    metadata: JSON.parse(row.metadata || '{}'),
    audit_logs: JSON.parse(row.audit_logs || '[]')
  }));
}

export async function getWeeklyChanges() {
  if (!db) return [];

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const rows = db.prepare(`
    SELECT * FROM nodes
    WHERE last_audited_date >= ?
  `).all(sevenDaysAgo);
  
  let totalRevisions = 0;
  const densifiedNodes = rows.map((row: any) => {
    totalRevisions += row.revision_count || 0;
    return {
      id: row.id,
      label: row.label,
      type: row.type,
      summary: row.summary
    };
  });
  
  if (densifiedNodes.length === 0) return [];
  
  return [{
    _id: null,
    total_revisions: totalRevisions,
    densified_nodes: densifiedNodes
  }];
}
