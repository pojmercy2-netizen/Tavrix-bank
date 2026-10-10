import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { withErrorHandler } from '../utils/error'
import { sendSuccess } from '../utils/response'

export default withErrorHandler(async (event) => {
  const filePath = join(process.cwd(), 'server', 'data', 'global_settings.json')
  
  // Ensure default file exists
  if (!existsSync(filePath)) {
    const defaults = {
      supportEmail: 'support@tavrixbank.com',
      supportPhone: '+1 (800) 555-0199'
    }
    writeFileSync(filePath, JSON.stringify(defaults, null, 2), 'utf-8')
  }

  const settings = JSON.parse(readFileSync(filePath, 'utf-8'))
  return sendSuccess(event, settings)
})
