import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayService } from '#services/gateway/gateway_service'
import { createPurchaseValidator } from '#validators/purchase'

@inject()
export default class PurchaseController {
  constructor(private gatewayService: GatewayService) {}

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPurchaseValidator)

    const product = await Product.find(payload.productId)
    if (!product) return response.notFound({ message: 'Product not found' })

    const totalAmount = product.amount * payload.quantity

    // Reutiliza o cliente se o e-mail já existe no banco, senão cria um novo
    const client = await Client.firstOrCreate(
      { email: payload.client.email },
      { name: payload.client.name, email: payload.client.email }
    )

    let chargeResult: Awaited<ReturnType<GatewayService['charge']>>
    try {
      chargeResult = await this.gatewayService.charge({
        amount: totalAmount,
        name: client.name,
        email: client.email,
        cardNumber: payload.card.number,
        cvv: payload.card.cvv,
      })
    } catch {
      return response.unprocessableEntity({ message: 'Payment could not be processed' })
    }

    const transaction = await Transaction.create({
      clientId: client.id,
      gatewayId: chargeResult.gatewayId,
      productId: product.id,
      quantity: payload.quantity,
      externalId: chargeResult.result.externalId,
      status: chargeResult.result.status,
      amount: totalAmount,
      cardLastNumbers: chargeResult.result.cardLastNumbers,
    })

    return response.created({
      id: transaction.id,
      amount: transaction.amount,
      status: transaction.status,
      externalId: transaction.externalId,
      cardLastNumbers: transaction.cardLastNumbers,
      quantity: transaction.quantity,
      client: { id: client.id, name: client.name, email: client.email },
      product: { id: product.id, name: product.name, amount: product.amount },
    })
  }
}
