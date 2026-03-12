import Gateway from '#models/gateway'
import { Gateway1Provider } from './providers/gateway1_provider.js'
import { Gateway2Provider } from './providers/gateway2_provider.js'
import type {
  GatewayChargeInput,
  GatewayChargeResult,
  GatewayProvider,
} from './contracts/gateway_provider.js'

export interface GatewayChargeOutput {
  result: GatewayChargeResult
  gatewayId: number
}

/**
 * Tenta cobrar em cada gateway ativo, em ordem de prioridade crescente.
 * Se o primeiro falhar, tenta o próximo. Retorna no primeiro sucesso.
 * O reembolso é roteado diretamente ao provider que processou a cobrança original.
 */
export class GatewayService {
  private readonly providers: Map<string, GatewayProvider>

  constructor(providers?: Map<string, GatewayProvider>) {
    this.providers =
      providers ??
      new Map<string, GatewayProvider>([
        ['Gateway 1', new Gateway1Provider()],
        ['Gateway 2', new Gateway2Provider()],
      ])
  }

  async charge(input: GatewayChargeInput): Promise<GatewayChargeOutput> {
    const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')

    if (gateways.length === 0) {
      throw new Error('No active gateways available')
    }

    const errors: string[] = []

    for (const gateway of gateways) {
      const provider = this.providers.get(gateway.name)
      if (!provider) continue

      try {
        const result = await provider.charge(input)
        return { result, gatewayId: gateway.id }
      } catch (error) {
        errors.push(`${gateway.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    throw new Error(`All gateways failed. Errors: ${errors.join('; ')}`)
  }

  async refund(externalId: string, gatewayId: number): Promise<void> {
    const gateway = await Gateway.findOrFail(gatewayId)
    const provider = this.providers.get(gateway.name)

    if (!provider) {
      throw new Error(`No provider registered for gateway: ${gateway.name}`)
    }

    await provider.refund(externalId)
  }
}
