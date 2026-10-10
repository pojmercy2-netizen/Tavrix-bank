import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { withErrorHandler } from '../../../utils/error'
import { requireAdmin } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  await requireAdmin(event)

  const filePath = join(process.cwd(), 'server', 'data', 'crypto_wallets.json')
  const wallets = JSON.parse(readFileSync(filePath, 'utf-8'))

  return sendSuccess(event, wallets)
})
