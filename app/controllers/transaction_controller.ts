import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Transaction from '#models/transaction'
import { GatewayService } from '#services/gateway/gateway_service'

@inject()
export default class TransactionController {
  constructor(private gatewayService: GatewayService) {}
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

  async refund({ params, response }: HttpContext) {
    const transaction = await Transaction.find(params.id)
    if (!transaction) return response.notFound({ message: 'Transaction not found' })

    if (transaction.status !== 'paid') {
      return response.unprocessableEntity({ message: 'Only paid transactions can be refunded' })
    }

    if (!transaction.externalId) {
      return response.unprocessableEntity({ message: 'Transaction has no external ID' })
    }

    try {
      await this.gatewayService.refund(transaction.externalId, transaction.gatewayId)
    } catch {
      return response.unprocessableEntity({ message: 'Refund could not be processed' })
    }

    transaction.status = 'refunded'
    await transaction.save()

    return response.ok({
      message: 'Refund processed successfully',
      id: transaction.id,
      status: transaction.status,
    })
  }
}
