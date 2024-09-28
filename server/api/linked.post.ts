import { Account } from '~/server/models/mongo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const debug = process.env.DEBUG ?? false
  if (debug) {
    console.log(body)
  }

  const { username } = body

  if (debug) {
    console.log(`Username received: "${username}"`)
  }

  if (!username) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing username',
      fatal: false,
    })
  }
  // allow connection for unclaimable accounts
  const not_claimable_list = process.env.NOT_CLAIMABLE_ACCOUNTS?.split(',') ?? []
  if (debug) {
    console.log('Not claimable: ', not_claimable_list)
  }
  if (not_claimable_list.includes(username)) {
    if (debug) {
      console.log(`login success: not claimable`)
    }
    return 'ok'
  }

  // check if linked
  const linked = await Account.findOne({ du_account_name: username })
  if (debug) {
    console.log(`login linked: `, linked)
  }
  if (!linked) {
    if (debug) {
      console.log(`login rejected: not claimed`)
    }
    return createError({
      statusCode: 403,
      message: 'Account not linked.',
      fatal: false,
    })
  }
  if (debug) {
    console.log(`login success: claimed`)
  }
  return 'ok'
})
