import { Account } from '~/server/models/mongo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const { username } = body

  if (!username) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing username',
      fatal: false,
    })
  }
  // check if linked
  const linked = await Account.findOne({ du_account_name: username })
  if (!linked) {
    return createError({
      statusCode: 403,
      message: 'Account not linked.',
      fatal: false,
    })
  }
  return 'ok'
})
