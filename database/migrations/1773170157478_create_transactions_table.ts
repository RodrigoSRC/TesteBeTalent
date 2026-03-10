import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('client_id').unsigned().notNullable().references('id').inTable('clients')
      table.integer('gateway_id').unsigned().notNullable().references('id').inTable('gateways')
      table.integer('product_id').unsigned().notNullable().references('id').inTable('products')
      table.integer('quantity').notNullable()
      table.string('external_id').nullable()
      table
        .enum('status', ['pending', 'paid', 'refunded', 'failed'])
        .notNullable()
        .defaultTo('pending')
      table.integer('amount').notNullable() // valor total em centavos
      table.string('card_last_numbers', 4).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
