import type { HttpContext } from '@adonisjs/core/http'
import Gateway from '#models/gateway'

export default class GatewayController {
  async toggle({ params, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway not found' })

    gateway.isActive = !gateway.isActive
    await gateway.save()

    return response.ok({
      id: gateway.id,
      name: gateway.name,
      isActive: gateway.isActive,
      priority: gateway.priority,
    })
  }

  async priority({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) return response.notFound({ message: 'Gateway not found' })

    const { priority } = request.only(['priority'])
    if (typeof priority !== 'number' || !Number.isInteger(priority) || priority < 0) {
      return response.unprocessableEntity({ message: 'Priority must be a non-negative integer' })
    }

    gateway.priority = priority
    await gateway.save()

    return response.ok({
      id: gateway.id,
      name: gateway.name,
      isActive: gateway.isActive,
      priority: gateway.priority,
    })
  }
}
