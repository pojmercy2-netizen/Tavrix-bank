import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import dotenv from 'dotenv'
import { users } from './schema/users'
import { eq, ilike } from 'drizzle-orm'

dotenv.config()

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing!')

  const client = postgres(url, { max: 1 })
  const db = drizzle(client)

  // 1. List all users
  console.log('\n=== All users in database ===')
  const allUsers = await db.select({ id: users.id, email: users.email, role: users.role, fullName: users.fullName }).from(users)
  for (const u of allUsers) {
    console.log(`  [${u.role}] ${u.email} — ${u.fullName} (${u.id})`)
  }

  // 2. Try to find pojmercy2 (exact or partial match)
  const target = allUsers.find(u => u.email.toLowerCase().includes('pojmercy2'))

  if (!target) {
    console.log('\n❌ No user matching "pojmercy2" found. Use UPSERT to create superadmin.')

    // Create the superadmin account if it doesn't exist
    const { hashSync } = await import('bcryptjs')
    const passwordHash = hashSync('Admin@1234', 12)

    const [newAdmin] = await db.insert(users).values({
      email: 'pojmercy2@gmail.com',
      fullName: 'Super Admin',
      username: 'pojmercy2_admin',
      phone: '0000000000',
      passwordHash,
      role: 'superadmin',
      status: 'active',
      kycStatus: 'verified'
    }).onConflictDoUpdate({
      target: users.email,
      set: { role: 'superadmin' }
    }).returning()

    if (newAdmin) {
      console.log('\n✅ Superadmin account created/updated:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      })
    } else {
      console.log('\n✅ Superadmin account update/insert executed.')
    }
  } else {
    // 3. Update existing user to superadmin
    const [updated] = await db
      .update(users)
      .set({ role: 'superadmin' })
      .where(eq(users.id, target.id))
      .returning()

    if (updated) {
      console.log(`\n✅ Updated ${updated.email} to role: ${updated.role}`)
    } else {
      console.log(`\n✅ Updated user to role: superadmin`)
    }
  }

  await client.end()
  process.exit(0)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
