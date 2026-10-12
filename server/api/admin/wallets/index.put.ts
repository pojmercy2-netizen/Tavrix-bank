import { z } from 'zod'
import { withErrorHandler, badRequest } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { logAdminAction } from '../../../utils/adminLog'
import { sendSuccess } from '../../../utils/response'
import { getCryptoWallets, saveCryptoWallets } from '../../../utils/systemSettings'

const updateWalletSchema = z.object({
  coin: z.enum(['BTC', 'ETH', 'USDT']),
  address: z.string().min(10, 'Wallet address is too short'),
  network: z.string().optional(),
  label: z.string().optional()
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const { coin, address, network, label } = updateWalletSchema.parse(body)
  const wallets = await getCryptoWallets()

  const idx = wallets.findIndex(w => w.coin === coin)
  const targetWallet = wallets[idx]
  if (idx === -1 || !targetWallet) {
    badRequest(`Coin "${coin}" not found in wallet config`)
    return
  }

  const oldAddress = targetWallet.address
  const updatedWallet = {
    coin: targetWallet.coin,
    label: label ?? targetWallet.label,
    network: network ?? targetWallet.network,
    address
  }
  wallets[idx] = updatedWallet

  await saveCryptoWallets(wallets)

  // Audit log
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_WALLET_ADDRESS',
    targetType: 'crypto_wallets',
    targetId: coin,
    details: { coin, oldAddress, newAddress: address }
  })

  return sendSuccess(event, updatedWallet, `${coin} wallet address updated successfully`)
})
