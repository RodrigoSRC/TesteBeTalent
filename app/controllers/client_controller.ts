import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'

export default class ClientController {
  async index({ response }: HttpContext) {
    const clients = await Client.all()
    return response.ok(clients)
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.query()
      .where('id', params.id)
      .preload('transactions', (query) => {
        query.preload('product').preload('gateway')
      })
      .first()

    if (!client) return response.notFound({ message: 'Client not found' })
    return response.ok(client)
  }
}
