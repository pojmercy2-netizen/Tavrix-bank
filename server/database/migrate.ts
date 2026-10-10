import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is missing!')
  }

  console.log('Connecting database for migrations...')
  const migrationClient = postgres(url, { max: 1 })
  const db = drizzle(migrationClient)

  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './server/database/migrations' })

  console.log('Migrations complete!')
  await migrationClient.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
