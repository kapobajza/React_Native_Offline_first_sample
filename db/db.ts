import * as SQLite from 'expo-sqlite';

function openDb() {
  return SQLite.openDatabase('offline.db');
}

export const SQLiteDatabase = openDb();

export async function dropDatabase() {
  await SQLiteDatabase.closeAsync();
  await SQLiteDatabase.deleteAsync();
}

export async function initDatabase() {
  await SQLiteDatabase.transactionAsync(async (tx) => {
    await tx.executeSqlAsync(`
    CREATE TABLE IF NOT EXISTS ${TableNames.QUERY_CLIENTS} (
      id INTEGER PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      buster TEXT
    )`);

    await tx.executeSqlAsync(`
    CREATE TABLE IF NOT EXISTS ${TableNames.QUERY_CLIENT_QUERIES} (
      query_hash TEXT PRIMARY KEY,
      value TEXT,
      query_client_id INTEGER NOT NULL,
      FOREIGN KEY(query_client_id) REFERENCES query_clients(id)
    )`);

    await tx.executeSqlAsync(`
    CREATE TABLE IF NOT EXISTS ${TableNames.QUERY_CLIENT_MUTATIONS} (
      mutation_key TEXT PRIMARY KEY,
      value TEXT,
      query_client_id INTEGER NOT NULL,
      FOREIGN KEY(query_client_id) REFERENCES query_clients(id)
    )`);
  });
}

export const TableNames = {
  QUERY_CLIENTS: 'query_clients',
  QUERY_CLIENT_QUERIES: 'query_client_queries',
  QUERY_CLIENT_MUTATIONS: 'query_client_mutations',
} as const;

export const QUERY_CLIENT_INITIAL_ID = 1;
