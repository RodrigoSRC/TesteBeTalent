import env from '#start/env'
import type {
  GatewayChargeInput,
  GatewayChargeResult,
  GatewayProvider,
} from '../contracts/gateway_provider.js'

/**
 * Autenticação: headers fixos em cada requisição (sem passo de login).
 * Campos do body em português conforme contrato da API.
 * CVV 200 ou 300 simulam erro no gateway.
 */
export class Gateway2Provider implements GatewayProvider {
  readonly baseUrl: string
  private readonly authHeaders: Record<string, string>

  constructor() {
    this.baseUrl = env.get('GATEWAY2_URL') ?? 'http://localhost:3002'
    this.authHeaders = {
      'Gateway-Auth-Token': 'tk_f2198cc671b5289fa856',
      'Gateway-Auth-Secret': '3d15e8ed6131446ea7e3456728b1211f',
    }
  }

  async charge(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    const response = await fetch(`${this.baseUrl}/transacoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify({
        valor: input.amount,
        nome: input.name,
        email: input.email,
        numeroCartao: input.cardNumber,
        cvv: input.cvv,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway 2 charge failed (HTTP ${response.status})`)
    }

    const data = (await response.json()) as { id: string }
    return {
      externalId: data.id,
      status: 'paid',
      cardLastNumbers: input.cardNumber.slice(-4),
    }
  }

  async refund(externalId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/transacoes/reembolso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
      },
      body: JSON.stringify({ id: externalId }),
    })

    if (!response.ok) {
      throw new Error(`Gateway 2 refund failed (HTTP ${response.status})`)
    }
  }
}
