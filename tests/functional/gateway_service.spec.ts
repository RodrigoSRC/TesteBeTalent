import { test } from '@japa/runner'
import Gateway from '#models/gateway'
import { GatewayService } from '#services/gateway/gateway_service'
import type {
  GatewayChargeInput,
  GatewayChargeResult,
  GatewayProvider,
} from '#services/gateway/contracts/gateway_provider'

class SuccessProvider implements GatewayProvider {
  async charge(_input: GatewayChargeInput): Promise<GatewayChargeResult> {
    return { externalId: 'mock-ext-123', status: 'paid', cardLastNumbers: '6063' }
  }
  async refund(_externalId: string): Promise<void> {}
}

class FailProvider implements GatewayProvider {
  async charge(_input: GatewayChargeInput): Promise<GatewayChargeResult> {
    throw new Error('Payment declined by mock gateway')
  }
  async refund(_externalId: string): Promise<void> {
    throw new Error('Refund declined by mock gateway')
  }
}

const chargeInput: GatewayChargeInput = {
  amount: 1990,
  name: 'Test User',
  email: 'test@example.com',
  cardNumber: '5569000000006063',
  cvv: '010',
}

test.group('GatewayService.charge', (group) => {
  group.each.setup(async () => {
    await Gateway.query().delete()
  })

  test('should use the gateway with the lowest priority number first', async ({ assert }) => {
    const gw1 = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    await Gateway.create({ name: 'Gateway 2', isActive: true, priority: 2 })

    const service = new GatewayService(
      new Map([
        ['Gateway 1', new SuccessProvider()],
        ['Gateway 2', new SuccessProvider()],
      ])
    )

    const { result, gatewayId } = await service.charge(chargeInput)

    assert.equal(gatewayId, gw1.id)
    assert.equal(result.externalId, 'mock-ext-123')
    assert.equal(result.cardLastNumbers, '6063')
    assert.equal(result.status, 'paid')
  })

  test('should fall back to the second gateway when the first fails', async ({ assert }) => {
    await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    const gw2 = await Gateway.create({ name: 'Gateway 2', isActive: true, priority: 2 })

    const service = new GatewayService(
      new Map([
        ['Gateway 1', new FailProvider()],
        ['Gateway 2', new SuccessProvider()],
      ])
    )

    const { gatewayId } = await service.charge(chargeInput)

    assert.equal(gatewayId, gw2.id)
  })

  test('should throw when all active gateways fail', async ({ assert }) => {
    await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    await Gateway.create({ name: 'Gateway 2', isActive: true, priority: 2 })

    const service = new GatewayService(
      new Map([
        ['Gateway 1', new FailProvider()],
        ['Gateway 2', new FailProvider()],
      ])
    )

    await assert.rejects(() => service.charge(chargeInput), /all gateways failed/i)
  })

  test('should skip inactive gateways even with higher priority', async ({ assert }) => {
    await Gateway.create({ name: 'Gateway 1', isActive: false, priority: 1 })
    const gw2 = await Gateway.create({ name: 'Gateway 2', isActive: true, priority: 2 })

    const service = new GatewayService(
      new Map([
        ['Gateway 1', new SuccessProvider()],
        ['Gateway 2', new SuccessProvider()],
      ])
    )

    const { gatewayId } = await service.charge(chargeInput)

    assert.equal(gatewayId, gw2.id)
  })

  test('should throw when no active gateways exist', async ({ assert }) => {
    await Gateway.create({ name: 'Gateway 1', isActive: false, priority: 1 })

    const service = new GatewayService(new Map([['Gateway 1', new SuccessProvider()]]))

    await assert.rejects(() => service.charge(chargeInput), /no active gateways/i)
  })

  test('should skip active gateways with no registered provider', async ({ assert }) => {
    await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    const gw2 = await Gateway.create({ name: 'Gateway 2', isActive: true, priority: 2 })

    // Gateway 1 is in the DB but has no provider — should be silently skipped
    const service = new GatewayService(new Map([['Gateway 2', new SuccessProvider()]]))

    const { gatewayId } = await service.charge(chargeInput)

    assert.equal(gatewayId, gw2.id)
  })
})

test.group('GatewayService.refund', (group) => {
  group.each.setup(async () => {
    await Gateway.query().delete()
  })

  test('should call refund on the correct provider with the correct externalId', async ({
    assert,
  }) => {
    let capturedId: string | undefined

    class SpyProvider implements GatewayProvider {
      async charge(): Promise<GatewayChargeResult> {
        return { externalId: 'spy-ext-999', status: 'paid', cardLastNumbers: '1234' }
      }
      async refund(externalId: string): Promise<void> {
        capturedId = externalId
      }
    }

    const gw = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    const service = new GatewayService(new Map([['Gateway 1', new SpyProvider()]]))

    await service.refund('spy-ext-999', gw.id)

    assert.equal(capturedId, 'spy-ext-999')
  })

  test('should throw when the gateway has no registered provider', async ({ assert }) => {
    const gw = await Gateway.create({ name: 'Unknown Gateway', isActive: true, priority: 1 })

    const service = new GatewayService(new Map([['Gateway 1', new SuccessProvider()]]))

    await assert.rejects(() => service.refund('ext-000', gw.id), /no provider registered/i)
  })

  test('should throw when the gateway row does not exist in the database', async ({ assert }) => {
    const service = new GatewayService(new Map())

    await assert.rejects(() => service.refund('ext-000', 99999))
  })
})
