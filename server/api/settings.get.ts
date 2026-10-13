import { withErrorHandler } from '../utils/error'
import { sendSuccess } from '../utils/response'
import { getGlobalSettings } from '../utils/systemSettings'

export default withErrorHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  const settings = await getGlobalSettings()
  return sendSuccess(event, settings)
})
