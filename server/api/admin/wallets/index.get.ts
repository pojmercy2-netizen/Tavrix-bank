import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'
import { getCryptoWallets } from '../../../utils/systemSettings'

export default withErrorHandler(async (event) => {
  await requireAdmin(event)
  const wallets = await getCryptoWallets()
  return sendSuccess(event, wallets)
})
