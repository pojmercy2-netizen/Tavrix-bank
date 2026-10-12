import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

let _db: ReturnType<typeof drizzle> | null = null

export function useDb() {
  if (!_db) {
    const config = useRuntimeConfig()
    const connectionString = config.databaseUrl

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured. Set it in your .env file.')
    }

    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
      prepare: false // Essential for Neon PgBouncer transaction pooling
    })

    _db = drizzle(client, { schema })
  }

  return _db
}

export { schema }
