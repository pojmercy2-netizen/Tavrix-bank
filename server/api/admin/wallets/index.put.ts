import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'

const updateWalletSchema = z.object({
  coin: z.enum(['BTC', 'ETH', 'USDT']),
  address: z.string().min(10, 'Wallet address is too short'),
  network: z.string().optional(),
  label: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const validated = updateWalletSchema.safeParse(body)
  if (!validated.success) {
    badRequest(validated.error.errors[0]?.message || 'Invalid request body')
    return
  }

  const { coin, address, network, label } = validated.data

  const filePath = join(process.cwd(), 'server', 'data', 'crypto_wallets.json')
  const wallets: Array<{ coin: string; label: string; network: string; address: string }> =
    JSON.parse(readFileSync(filePath, 'utf-8'))

  const idx = wallets.findIndex(w => w.coin === coin)
  if (idx === -1) {
    badRequest(`Coin "${coin}" not found in wallet config`)
    return
  }

  const oldAddress = wallets[idx].address

  wallets[idx] = {
    ...wallets[idx],
    address,
    ...(network ? { network } : {}),
    ...(label ? { label } : {})
  }

  writeFileSync(filePath, JSON.stringify(wallets, null, 2), 'utf-8')

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_WALLET_ADDRESS',
    targetType: 'crypto_wallets',
    targetId: coin,
    details: { coin, oldAddress, newAddress: address }
  })

  return sendSuccess(event, wallets[idx], `${coin} wallet address updated successfully`)
})
