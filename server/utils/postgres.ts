import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from '~~/server/models/postgres'

const host = process.env.PG_HOST || 'postgres'
const port = 5432
const user = 'postgres'
const password = 'postgres'
const db = 'dual'
const url = `postgres://${user}:${password}@${host}:${port}/${db}`
console.log('Postgres URL: ', url)
const queryClient = postgres(url)

export async function getPgClient() {
  return drizzle(queryClient, { schema })
}
