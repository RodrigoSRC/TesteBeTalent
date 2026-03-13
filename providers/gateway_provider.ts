import type { ApplicationService } from '@adonisjs/core/types'
import { GatewayService } from '#services/gateway/gateway_service'

export default class GatewayProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(GatewayService, () => new GatewayService())
  }
}
