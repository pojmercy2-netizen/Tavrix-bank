import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { accounts } from '../../database/schema/accounts'
import { withErrorHandler } from '../../utils/error'
import { requireActiveUser } from '../../utils/auth'
import { sendSuccess } from '../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, authUser.id))

  const formatted = userAccounts.map(acc => ({
    id: acc.id,
    accountNumber: acc.accountNumber,
    accountType: acc.accountType,
    balance: parseFloat(acc.balance),
    currency: acc.currency,
    isFrozen: acc.isFrozen,
    createdAt: acc.createdAt
  }))

  return sendSuccess(event, formatted)
})
