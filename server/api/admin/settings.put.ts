import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { withErrorHandler, badRequest } from '../../utils/error'
import { requireAdmin } from '../../utils/auth'
import { logAdminAction } from '../../utils/adminLog'
import { sendSuccess } from '../../utils/response'

const updateSettingsSchema = z.object({
  supportEmail: z.string().email('Please enter a valid email address'),
  supportPhone: z.string().min(5, 'Helpline number is too short')
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const validated = updateSettingsSchema.safeParse(body)
  if (!validated.success) {
    badRequest(validated.error.errors[0]?.message || 'Invalid input values')
    return
  }

  const { supportEmail, supportPhone } = validated.data
  const filePath = join(process.cwd(), 'server', 'data', 'global_settings.json')

  const oldSettings = JSON.parse(readFileSync(filePath, 'utf-8'))

  const newSettings = {
    ...oldSettings,
    supportEmail,
    supportPhone
  }

  writeFileSync(filePath, JSON.stringify(newSettings, null, 2), 'utf-8')

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_GLOBAL_SETTINGS',
    targetType: 'global_settings',
    details: { oldSettings, newSettings }
  })

  return sendSuccess(event, newSettings, 'Global settings updated successfully')
})
