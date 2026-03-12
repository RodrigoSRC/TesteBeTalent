import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayService } from '#services/gateway/gateway_service'

// ─── Mock GatewayService ──────────────────────────────────────────────────────

class MockGatewayService extends GatewayService {
  constructor() {
    super(new Map())
  }
  async refund(_externalId: string, _gatewayId: number): Promise<void> {}
}

class FailingRefundService extends GatewayService {
  constructor() {
    super(new Map())
  }
  async refund(_externalId: string, _gatewayId: number): Promise<void> {
    throw new Error('Gateway refund failed')
  }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

async function getAuthUser() {
  return User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

async function createPaidTransaction() {
  const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
  const buyer = await Client.create({ name: 'Test User', email: 'test@example.com' })
  const product = await Product.create({ name: 'Produto X', amount: 1990 })

  const transaction = await Transaction.create({
    clientId: buyer.id,
    gatewayId: gateway.id,
    productId: product.id,
    quantity: 1,
    externalId: 'ext-abc-123',
    status: 'paid',
    amount: 1990,
    cardLastNumbers: '6063',
  })

  return transaction
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.group('POST /transactions/:id/refund', (group) => {
  group.each.setup(async () => {
    await Transaction.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Gateway.query().delete()
    await User.query().delete()

    app.container.swap(GatewayService, () => new MockGatewayService())
    return () => app.container.restore(GatewayService)
  })

  test('should refund a paid transaction and update its status', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const tx = await createPaidTransaction()

    const response = await client.post(`/transactions/${tx.id}/refund`).loginAs(admin)

    response.assertStatus(200)
    assert.equal(response.body().status, 'refunded')
    assert.equal(response.body().id, tx.id)

    const updated = await Transaction.find(tx.id)
    assert.equal(updated!.status, 'refunded')
  })

  test('should return 404 when transaction does not exist', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.post('/transactions/99999/refund').loginAs(admin)
    response.assertStatus(404)
  })

  test('should return 422 when transaction is not in paid status', async ({ client }) => {
    const admin = await getAuthUser()
    const tx = await createPaidTransaction()
    await tx.merge({ status: 'refunded' }).save()

    const response = await client.post(`/transactions/${tx.id}/refund`).loginAs(admin)
    response.assertStatus(422)
  })

  test('should return 422 when gateway refund fails', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const tx = await createPaidTransaction()

    app.container.swap(GatewayService, () => new FailingRefundService())

    const response = await client.post(`/transactions/${tx.id}/refund`).loginAs(admin)
    response.assertStatus(422)

    const unchanged = await Transaction.find(tx.id)
    assert.equal(unchanged!.status, 'paid')
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.post('/transactions/1/refund')
    response.assertStatus(401)
  })
})
