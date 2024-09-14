import { pgTable, text, bigint, boolean } from 'drizzle-orm/pg-core'

export interface Auth {
  id: number
  user_name: string
  password: string
  roles: string
  titles: string
  muted: boolean
  magic: string
}

export const auth = pgTable('auth', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  user_name: text('user_name').notNull(),
  password: text('password').notNull(),
  roles: text('roles').notNull(),
  titles: text('titles').notNull(),
  muted: boolean('muted').notNull(),
  magic: text('magic').notNull(),
})
