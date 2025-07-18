import { pgTable, text, uuid } from 'drizzle-orm/pg-core'

export const rooms = pgTable('rooms', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull()
})
