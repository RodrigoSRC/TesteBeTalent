import env from '#start/env'
import type {
  GatewayChargeInput,
  GatewayChargeResult,
  GatewayProvider,
} from '../contracts/gateway_provider.js'

/**
 * Autenticação: POST /login com credenciais fixas → Bearer token obtido a cada chamada.
 * CVV 100 ou 200 simulam erro no gateway.
 */
export class Gateway1Provider implements GatewayProvider {
  readonly baseUrl: string

  constructor() {
    this.baseUrl = env.get('GATEWAY1_URL') ?? 'http://localhost:3001'
  }

  private async authenticate(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.get('GATEWAY1_AUTH_EMAIL') ?? 'dev@betalent.tech',
        token: env.get('GATEWAY1_AUTH_TOKEN') ?? 'FEC9BB078BF338F464F96B48089EB498',
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway 1 authentication failed (HTTP ${response.status})`)
    }

    const data = (await response.json()) as { token: string }
    return data.token
  }

  async charge(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    const token = await this.authenticate()

    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: input.amount,
        name: input.name,
        email: input.email,
        cardNumber: input.cardNumber,
        cvv: input.cvv,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway 1 charge failed (HTTP ${response.status})`)
    }

    const data = (await response.json()) as { id: string }
    return {
      externalId: data.id,
      status: 'paid',
      cardLastNumbers: input.cardNumber.slice(-4),
    }
  }

  async refund(externalId: string): Promise<void> {
    const token = await this.authenticate()

    const response = await fetch(`${this.baseUrl}/transactions/${externalId}/charge_back`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Gateway 1 refund failed (HTTP ${response.status})`)
    }
  }
}
