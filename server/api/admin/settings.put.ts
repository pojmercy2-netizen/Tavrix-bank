import { z } from 'zod'
import { withErrorHandler, badRequest } from '../../utils/error'
import { requireAdmin } from '../../utils/auth'
import { logAdminAction } from '../../utils/adminLog'
import { sendSuccess } from '../../utils/response'
import { getGlobalSettings, saveGlobalSettings } from '../../utils/systemSettings'

const updateSettingsSchema = z.object({
  supportEmail: z.string().email('Please enter a valid email address'),
  supportPhone: z.string().min(5, 'Helpline number is too short')
})

export default withErrorHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const { supportEmail, supportPhone } = updateSettingsSchema.parse(body)
  const oldSettings = await getGlobalSettings()

  const newSettings = {
    ...oldSettings,
    supportEmail,
    supportPhone
  }

  await saveGlobalSettings(newSettings)

  // Log admin audit action
  await logAdminAction(event, {
    adminId: admin.id,
    action: 'UPDATE_GLOBAL_SETTINGS',
    targetType: 'global_settings',
    details: { oldSettings, newSettings }
  })

  return sendSuccess(event, newSettings, 'Global settings updated successfully')
})
