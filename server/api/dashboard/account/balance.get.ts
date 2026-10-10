import { eq, and } from 'drizzle-orm'
import { useDb } from '../../../database/client'
import { accounts } from '../../../database/schema/accounts'
import { withErrorHandler } from '../../../utils/error'
import { requireActiveUser } from '../../../utils/auth'
import { sendSuccess } from '../../../utils/response'

export default withErrorHandler(async (event) => {
  const authUser = await requireActiveUser(event)
  const db = useDb()

  // Retrieve the user's checking account balance
  const [checkingAccount] = await db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.userId, authUser.id),
        eq(accounts.accountType, 'checking')
      )
    )
    .limit(1)

  const balance = checkingAccount ? parseFloat(checkingAccount.balance) : 0.00

  return sendSuccess(event, {
    balance,
    currency: checkingAccount?.currency || 'USD',
    accountNumber: checkingAccount?.accountNumber || ''
  })
})
