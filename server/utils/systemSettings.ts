import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { eq, sql } from 'drizzle-orm'
import { useDb, schema } from '../database/client'

export interface GlobalSettings {
  supportEmail: string
  supportPhone: string
}

export interface CryptoWallet {
  coin: string
  label: string
  network: string
  address: string
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  supportEmail: 'support@tavrixbank.com',
  supportPhone: '+16064625390'
}

export const DEFAULT_CRYPTO_WALLETS: CryptoWallet[] = [
  {
    coin: 'BTC',
    label: 'Bitcoin (BTC)',
    network: 'Bitcoin',
    address: 'sdfghgfdgtseadsfdgfhgjhfgfrsdtgfgjghrsdgfh'
  },
  {
    coin: 'ETH',
    label: 'Ethereum (ETH)',
    network: 'ERC20 (Ethereum)',
    address: 'kjhgfdfghjkjhgfgdfdfghjkjhgfdx'
  },
  {
    coin: 'USDT',
    label: 'Tether (USDT)',
    network: 'TRC20 (Tron)',
    address: 'e;wkljrfrwklelklrjfjrwleq;rkwfnrml;leqkrfw'
  }
]

let isTableInitialized = false

async function ensureTable(db: any) {
  if (isTableInitialized) return
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "key" varchar(100) PRIMARY KEY,
        "value" jsonb NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `)
    isTableInitialized = true
  } catch (err) {
    // If table creation fails (e.g. read-only user), allow normal query to proceed or fail gracefully
  }
}

function tryReadLocalJson<T>(filename: string): T | null {
  try {
    const filePath = join(process.cwd(), 'server', 'data', filename)
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as T
    }
  } catch {
    // File not found or read error (common on serverless runtimes)
  }
  return null
}

function tryWriteLocalJson(filename: string, data: any): void {
  try {
    const dir = join(process.cwd(), 'server', 'data')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(join(dir, filename), JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // Serverless runtimes (Netlify, AWS Lambda) have read-only filesystems. Safe to ignore.
  }
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const db = useDb()
    await ensureTable(db)

    const record = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, 'global_settings'))
      .limit(1)

    const first = record[0]
    if (first && first.value) {
      const val = first.value as Partial<GlobalSettings>
      return {
        supportEmail: val.supportEmail || DEFAULT_GLOBAL_SETTINGS.supportEmail,
        supportPhone: val.supportPhone || DEFAULT_GLOBAL_SETTINGS.supportPhone
      }
    }
  } catch {
    // Database query failed or unavailable, fallback gracefully below
  }

  const localData = tryReadLocalJson<GlobalSettings>('global_settings.json')
  if (localData && (localData.supportEmail || localData.supportPhone)) {
    return {
      supportEmail: localData.supportEmail || DEFAULT_GLOBAL_SETTINGS.supportEmail,
      supportPhone: localData.supportPhone || DEFAULT_GLOBAL_SETTINGS.supportPhone
    }
  }

  return { ...DEFAULT_GLOBAL_SETTINGS }
}

export async function saveGlobalSettings(settings: GlobalSettings): Promise<GlobalSettings> {
  tryWriteLocalJson('global_settings.json', settings)

  try {
    const db = useDb()
    await ensureTable(db)

    await db
      .insert(schema.systemSettings)
      .values({
        key: 'global_settings',
        value: settings,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: {
          value: settings,
          updatedAt: new Date()
        }
      })
  } catch (err) {
    console.error('[SystemSettings] Failed to persist global settings to database:', err)
  }

  return settings
}

export async function getCryptoWallets(): Promise<CryptoWallet[]> {
  try {
    const db = useDb()
    await ensureTable(db)

    const record = await db
      .select()
      .from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, 'crypto_wallets'))
      .limit(1)

    const first = record[0]
    if (first && Array.isArray(first.value)) {
      return first.value as CryptoWallet[]
    }
  } catch {
    // Database query failed or unavailable, fallback gracefully
  }

  const localData = tryReadLocalJson<CryptoWallet[]>('crypto_wallets.json')
  if (Array.isArray(localData) && localData.length > 0) {
    return localData
  }

  return [...DEFAULT_CRYPTO_WALLETS]
}

export async function saveCryptoWallets(wallets: CryptoWallet[]): Promise<CryptoWallet[]> {
  tryWriteLocalJson('crypto_wallets.json', wallets)

  try {
    const db = useDb()
    await ensureTable(db)

    await db
      .insert(schema.systemSettings)
      .values({
        key: 'crypto_wallets',
        value: wallets,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: schema.systemSettings.key,
        set: {
          value: wallets,
          updatedAt: new Date()
        }
      })
  } catch (err) {
    console.error('[SystemSettings] Failed to persist crypto wallets to database:', err)
  }

  return wallets
}
