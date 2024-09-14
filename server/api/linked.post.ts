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
  // allow connection for unclaimable accounts
  const not_claimable_list = process.env.NOT_CLAIMABLE_ACCOUNTS?.split(',') ?? []
  if (not_claimable_list.includes(username)) {
    return 'ok'
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
