import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { QUERY_CLIENT_INITIAL_ID, SQLiteDatabase, TableNames } from './db';
import SuperJSON from 'superjson';
import {
  ClientQueriesMutationsSchema,
  clientQueriesMutationsSchema,
  clientQuerySchema,
  ClientQuerySchema,
  sqliteSuccessResultSchema,
} from '../types/query';
import { DehydratedState, MutationKey, MutationState, QueryKey, QueryState } from '@tanstack/react-query';

export default function createSqlitePersister(): Persister {
  return {
    async persistClient(persistClient) {
      const { clientState, timestamp, buster } = persistClient;

      await SQLiteDatabase.transactionAsync(async (tx) => {
        const queryPromises = clientState.queries.map((query) => {
          return tx.executeSqlAsync(
            `
          INSERT OR REPLACE INTO ${TableNames.QUERY_CLIENT_QUERIES} (query_hash, value, query_client_id)
          VALUES (?, ?, ?)
          `,
            [query.queryHash, SuperJSON.stringify(query.state), QUERY_CLIENT_INITIAL_ID],
          );
        });

        const mutationPromises = clientState.mutations
          .filter((mutation) => mutation.mutationKey)
          .map((mutation) => {
            return tx.executeSqlAsync(
              `
            INSERT OR REPLACE INTO ${TableNames.QUERY_CLIENT_MUTATIONS} (mutation_key, value, query_client_id)
            VALUES (?, ?, ?)
          `,
              [SuperJSON.stringify(mutation.mutationKey), SuperJSON.stringify(mutation.state), QUERY_CLIENT_INITIAL_ID],
            );
          });

        await tx.executeSqlAsync(
          `
        INSERT OR REPLACE INTO ${TableNames.QUERY_CLIENTS} (id, timestamp, buster)
        VALUES (?, ?, ?)
      `,
          [QUERY_CLIENT_INITIAL_ID, timestamp, buster],
        );

        await Promise.all([...queryPromises, ...mutationPromises]);
      });
    },
    async removeClient() {
      await SQLiteDatabase.transactionAsync(async (tx) => {
        await tx.executeSqlAsync(
          `
        DELETE FROM ${TableNames.QUERY_CLIENTS}
        WHERE id = ?
        `,
          [QUERY_CLIENT_INITIAL_ID],
        );
      });
    },
    async restoreClient() {
      let client: PersistedClient | undefined;

      await SQLiteDatabase.transactionAsync(async (tx) => {
        const queriesMutationsResult = await tx.executeSqlAsync(
          `
        SELECT qcq.value 'query_value', qcq.query_hash 'query_hash', qcm.mutation_key 'mutation_key', qcm.value 'mutation_value' FROM ${TableNames.QUERY_CLIENTS} AS qc
        LEFT JOIN ${TableNames.QUERY_CLIENT_MUTATIONS} AS qcm ON qc.id = qcm.query_client_id
        JOIN ${TableNames.QUERY_CLIENT_QUERIES} AS qcq ON qc.id = qcq.query_client_id
        WHERE qc.id = ?;
        `,
          [QUERY_CLIENT_INITIAL_ID],
        );

        let queries: DehydratedState['queries'] = [];
        let mutations: DehydratedState['mutations'] = [];

        if (sqliteSuccessResultSchema.safeParse(queriesMutationsResult).success) {
          for (const row of queriesMutationsResult.rows) {
            if (clientQueriesMutationsSchema.safeParse(row).success) {
              const parsedRow = row as ClientQueriesMutationsSchema;

              if (parsedRow.query_value) {
                const state: QueryState = SuperJSON.parse(parsedRow.query_value);
                const queryKey: QueryKey = SuperJSON.parse(parsedRow.query_hash);

                queries.push({
                  queryHash: parsedRow.query_hash,
                  queryKey,
                  state,
                });
              }

              if (parsedRow.mutation_value && parsedRow.mutation_key) {
                const state: MutationState = SuperJSON.parse(parsedRow.mutation_value);
                const mutationKey: MutationKey = SuperJSON.parse(parsedRow.mutation_key);

                mutations.push({
                  mutationKey,
                  state,
                });
              }
            }
          }
        }

        const clientQueryResult = await tx.executeSqlAsync(
          `
        SELECT timestamp, buster FROM ${TableNames.QUERY_CLIENTS} WHERE id = ?;
        `,
          [QUERY_CLIENT_INITIAL_ID],
        );

        if (clientQuerySchema.safeParse(clientQueryResult.rows[0]).success) {
          const firstRow = clientQueryResult.rows[0] as ClientQuerySchema;

          client = {
            clientState: {
              queries,
              mutations,
            },
            timestamp: firstRow.timestamp,
            buster: firstRow.buster,
          };
        }
      });

      return client;
    },
  };
}
