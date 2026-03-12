import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'

export default class TransactionController {
  async index({ response }: HttpContext) {
    const transactions = await Transaction.query()
      .preload('client')
      .preload('gateway')
      .preload('product')
      .orderBy('created_at', 'desc')

    return response.ok(transactions)
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.query()
      .where('id', params.id)
      .preload('client')
      .preload('gateway')
      .preload('product')
      .first()

    if (!transaction) return response.notFound({ message: 'Transaction not found' })
    return response.ok(transaction)
  }
}
