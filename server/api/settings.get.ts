import { withErrorHandler } from '../utils/error'
import { sendSuccess } from '../utils/response'
import { getGlobalSettings } from '../utils/systemSettings'

export default withErrorHandler(async (event) => {
  const settings = await getGlobalSettings()
  return sendSuccess(event, settings)
})
