import { execSync } from 'child_process'

console.log('=== Production Deployment Build Started ===\n')

// Try loading dotenv to read local .env file (primarily for local production build tests)
try {
  const dotenv = await import('dotenv')
  dotenv.config()
} catch (error) {
  // Safe to ignore if dotenv is not available, as environment variables will be injected directly in production
}

const hasDatabaseUrl = !!process.env.DATABASE_URL

function runCommand(command) {
  console.log(`> Executing: ${command}`)
  execSync(command, { stdio: 'inherit' })
}

try {
  if (hasDatabaseUrl) {
    console.log('🔄 DATABASE_URL found. Running database migrations...')
    runCommand('npx tsx server/database/migrate.ts')
    console.log('✅ Database migrations successfully applied.\n')

    console.log('👤 Running superadmin initialization / check...')
    runCommand('npx tsx server/database/set_superadmin.ts')
    console.log('✅ Superadmin setup successfully checked.\n')
  } else {
    console.log('⚠️ DATABASE_URL is not set. Skipping database migrations and superadmin setup.')
    console.log('Note: If this is a CI/CD build stage, migrations should be run in the release/runtime stage instead.\n')
  }

  console.log('📦 Compiling Nuxt application for production...')
  runCommand('npx nuxt build')
  console.log('\n✅ Nuxt build completed successfully!')
  console.log('\n=== Production Deployment Build Finished ===')
} catch (error) {
  console.error('\n❌ Production build/deployment failed during execution.')
  process.exit(1)
}
