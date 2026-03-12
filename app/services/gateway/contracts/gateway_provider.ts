export interface GatewayChargeInput {
  /** Valor total em centavos (ex: 1990 = R$19,90) */
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export interface GatewayChargeResult {
  /** ID da transação no gateway, usado para reembolsos */
  externalId: string
  status: 'paid' | 'failed'
  /** Últimos 4 dígitos do cartão */
  cardLastNumbers: string
}

/**
 * Para adicionar um novo gateway: crie uma classe que implemente esta interface,
 * insira uma linha na tabela `gateways` com o mesmo `name` e registre no GatewayService.
 */
export interface GatewayProvider {
  charge(input: GatewayChargeInput): Promise<GatewayChargeResult>
  refund(externalId: string): Promise<void>
}
