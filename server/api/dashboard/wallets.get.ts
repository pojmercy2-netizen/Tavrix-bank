import { withErrorHandler } from '../../utils/error'
import { requireActiveUser } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'
import { getCryptoWallets } from '../../utils/systemSettings'

export default withErrorHandler(async (event) => {
  await requireActiveUser(event)
  const wallets = await getCryptoWallets()
  return sendSuccess(event, wallets)
})
