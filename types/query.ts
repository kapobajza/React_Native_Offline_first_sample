import { z } from 'zod';

export const resultSetErrorSchema = z.object({
  error: z.instanceof(Error),
});

export const clientQueriesMutationsSchema = z.object({
  mutation_value: z.string().nullable(),
  query_value: z.string().nullable(),
  query_hash: z.string(),
  mutation_key: z.string().nullable(),
});

export type ClientQueriesMutationsSchema = z.infer<typeof clientQueriesMutationsSchema>;

export const clientQuerySchema = z.object({
  timestamp: z.number(),
  buster: z.string(),
});

export type ClientQuerySchema = z.infer<typeof clientQuerySchema>;

export const sqliteSuccessResultSchema = z.object({
  insertId: z.number().optional(),
  rowsAffected: z.number(),
  rows: z.array(z.any()),
});

export type SqliteSuccessResultSchema = z.infer<typeof sqliteSuccessResultSchema>;
