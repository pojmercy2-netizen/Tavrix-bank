import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { users } from './schema/users'
import { accounts } from './schema/accounts'
import { transactions } from './schema/transactions'
import { kycDocuments } from './schema/kyc_documents'
import { deposits } from './schema/deposits'
import { transfers } from './schema/transfers'
import { cards } from './schema/cards'

dotenv.config()

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is missing!')
  }

  console.log('Connecting to database for seeding...')
  const client = postgres(url)
  const db = drizzle(client)

  // Clear existing data
  console.log('Cleaning up existing data...')
  await db.delete(transfers)
  await db.delete(deposits)
  await db.delete(kycDocuments)
  await db.delete(cards)
  await db.delete(transactions)
  await db.delete(accounts)
  await db.delete(users)

  console.log('Seeding database...')

  const defaultHash = await bcrypt.hash('Password123!', 12)
  const adminHash = await bcrypt.hash('Admin123!', 12)

  // 1. Seed Admin User
  const [adminUser] = await db
    .insert(users)
    .values({
      email: 'admin@korvex.com',
      fullName: 'Super Administrator',
      username: 'admin',
      phone: '1234567890',
      passwordHash: adminHash,
      role: 'admin',
      status: 'active',
      kycStatus: 'verified'
    })
    .returning()

  // 2. Seed Users
  const [john] = await db
    .insert(users)
    .values({
      email: 'john.smith@example.com',
      fullName: 'John Smith',
      username: 'johnsmith',
      phone: '5551234567',
      passwordHash: defaultHash,
      role: 'user',
      status: 'active',
      kycStatus: 'verified',
      address: '123 Financial Way, Suite 400\nNew York, NY 10004'
    })
    .returning()

  const [jane] = await db
    .insert(users)
    .values({
      email: 'jane.doe@example.com',
      fullName: 'Jane Doe',
      username: 'janedoe',
      phone: '5559876543',
      passwordHash: defaultHash,
      role: 'user',
      status: 'active',
      kycStatus: 'pending',
      address: '456 Wall Street\nNew York, NY 10005'
    })
    .returning()

  const [michael] = await db
    .insert(users)
    .values({
      email: 'michael.b@example.com',
      fullName: 'Michael Brown',
      username: 'michaelb',
      phone: '5551112222',
      passwordHash: defaultHash,
      role: 'user',
      status: 'suspended',
      kycStatus: 'unverified'
    })
    .returning()

  if (!adminUser || !john || !jane || !michael) {
    throw new Error('Failed to seed user records')
  }

  // 3. Seed Accounts
  // John Smith Accounts
  const [johnChecking] = await db
    .insert(accounts)
    .values({
      userId: john.id,
      accountNumber: '1000999001',
      accountType: 'checking',
      balance: '4287.19',
      currency: 'USD'
    })
    .returning()

  const [johnSavings] = await db
    .insert(accounts)
    .values({
      userId: john.id,
      accountNumber: '1000999002',
      accountType: 'savings',
      balance: '12560.43',
      currency: 'USD'
    })
    .returning()

  // Jane Doe Accounts
  const [janeChecking] = await db
    .insert(accounts)
    .values({
      userId: jane.id,
      accountNumber: '2000999001',
      accountType: 'checking',
      balance: '120.00',
      currency: 'USD'
    })
    .returning()

  // Michael Brown Accounts
  const [michaelChecking] = await db
    .insert(accounts)
    .values({
      userId: michael.id,
      accountNumber: '3000999001',
      accountType: 'checking',
      balance: '0.00',
      currency: 'USD'
    })
    .returning()

  if (!johnChecking || !johnSavings || !janeChecking || !michaelChecking) {
    throw new Error('Failed to seed account records')
  }

  // 4. Seed Transactions
  await db.insert(transactions).values([
    {
      accountId: johnChecking.id,
      userId: john.id,
      type: 'deposit',
      amount: '5000.00',
      description: 'Payroll Direct Deposit',
      status: 'completed',
      method: 'ACH Transfer',
      reference: 'TXN10001'
    },
    {
      accountId: johnChecking.id,
      userId: john.id,
      type: 'withdrawal',
      amount: '-712.81',
      description: 'Payment to Visa Credit Card',
      status: 'completed',
      method: 'Card Payment',
      reference: 'TXN10002'
    },
    {
      accountId: johnChecking.id,
      userId: john.id,
      type: 'transfer',
      amount: '-50.00',
      description: 'Transfer to Michael Brown',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'TXN10003'
    },
    {
      accountId: janeChecking.id,
      userId: jane.id,
      type: 'deposit',
      amount: '120.00',
      description: 'Opening Account Deposit',
      status: 'completed',
      method: 'Admin Credit',
      reference: 'TXN20001'
    }
  ])

  // 5. Seed KYC Documents
  await db.insert(kycDocuments).values([
    {
      userId: john.id,
      documentType: 'Passport',
      documentNumber: 'US12345678',
      expiryDate: '2030-12-31',
      frontImageUrl: 'mock_passport_front.png',
      backImageUrl: 'mock_passport_back.png',
      status: 'APPROVED',
      reviewedBy: adminUser.id,
      reviewedAt: new Date()
    },
    {
      userId: jane.id,
      documentType: 'Driver License',
      documentNumber: 'NY987654321',
      expiryDate: '2028-05-15',
      frontImageUrl: 'mock_dl_front.png',
      backImageUrl: 'mock_dl_back.png',
      status: 'PENDING'
    }
  ])

  // 6. Seed Deposits
  await db.insert(deposits).values([
    {
      userId: john.id,
      reference: 'DEP123456',
      method: 'Crypto (BTC)',
      amount: '2500.00',
      coin: 'BTC',
      walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      receiptUrl: 'mock_receipt.png',
      status: 'APPROVED',
      reviewedBy: adminUser.id,
      reviewedAt: new Date(),
      note: 'Added funds via Bitcoin'
    },
    {
      userId: jane.id,
      reference: 'DEP987654',
      method: 'Crypto (ETH)',
      amount: '800.00',
      coin: 'ETH',
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      receiptUrl: 'mock_eth_receipt.png',
      status: 'PENDING',
      note: 'Ethereum deposit awaiting review'
    }
  ])

  // 7. Seed Transfers
  await db.insert(transfers).values([
    {
      userId: john.id,
      method: 'Wise',
      amount: '150.00',
      recipientEmail: 'recipient@wise.com',
      recipientName: 'Alice Wise',
      currency: 'EUR',
      note: 'Freelance pay',
      status: 'completed'
    }
  ])

  // 8. Seed Cards
  await db.insert(cards).values([
    {
      userId: john.id,
      accountId: johnChecking.id,
      cardNumber: '4532718293810293',
      cardholderName: 'JOHN SMITH',
      expiryDate: '12/2028',
      cvv: '123',
      cardType: 'debit',
      isFrozen: false,
      status: 'active'
    },
    {
      userId: john.id,
      accountId: johnChecking.id,
      cardNumber: '4111222233334444',
      cardholderName: 'JOHN SMITH',
      expiryDate: '06/2029',
      cvv: '999',
      cardType: 'virtual',
      isFrozen: true,
      status: 'frozen'
    }
  ])

  console.log('Seeding completed successfully!');
  await client.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
