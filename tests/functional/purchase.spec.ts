import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayService, type GatewayChargeOutput } from '#services/gateway/gateway_service'

// ─── Mock GatewayService ──────────────────────────────────────────────────────

class MockGatewayService extends GatewayService {
  // gatewayId é configurado por cada teste para apontar ao gateway criado no DB
  constructor(private readonly mockGatewayId: number) {
    super(new Map())
  }

  async charge(): Promise<GatewayChargeOutput> {
    return {
      result: { externalId: 'mock-ext-123', status: 'paid', cardLastNumbers: '6063' },
      gatewayId: this.mockGatewayId,
    }
  }
}

class FailingGatewayService extends GatewayService {
  constructor() {
    super(new Map())
  }

  async charge(): Promise<GatewayChargeOutput> {
    throw new Error('All gateways failed')
  }
}

// ─── Fixture base ─────────────────────────────────────────────────────────────

const validPayload = {
  quantity: 2,
  client: { name: 'Test User', email: 'test@example.com' },
  card: { number: '5569000000006063', cvv: '010' },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.group('POST /purchases', (group) => {
  let gatewayId: number

  group.each.setup(async () => {
    await Transaction.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Gateway.query().delete()

    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    gatewayId = gateway.id

    app.container.swap(GatewayService, () => new MockGatewayService(gatewayId))
    return () => app.container.restore(GatewayService)
  })

  test('should create a purchase and return transaction details', async ({ client, assert }) => {
    const product = await Product.create({ name: 'Produto X', amount: 1990 })

    const response = await client
      .post('/purchases')
      .json({ ...validPayload, productId: product.id })

    response.assertStatus(201)
    const body = response.body()
    assert.equal(body.amount, 1990 * 2)
    assert.equal(body.status, 'paid')
    assert.equal(body.externalId, 'mock-ext-123')
    assert.equal(body.cardLastNumbers, '6063')
    assert.equal(body.quantity, 2)
    assert.equal(body.client.email, 'test@example.com')
    assert.equal(body.product.id, product.id)
    assert.equal(body.product.amount, 1990)
  })

  test('should calculate total amount from product price times quantity', async ({
    client,
    assert,
  }) => {
    const product = await Product.create({ name: 'Produto Y', amount: 500 })

    const response = await client
      .post('/purchases')
      .json({ ...validPayload, productId: product.id, quantity: 3 })

    response.assertStatus(201)
    assert.equal(response.body().amount, 500 * 3)
  })

  test('should reuse an existing client with the same email', async ({ client, assert }) => {
    const product = await Product.create({ name: 'Produto Z', amount: 1000 })
    await Client.create({ name: 'Existing User', email: 'test@example.com' })

    await client.post('/purchases').json({ ...validPayload, productId: product.id })

    const total = await Client.query().where('email', 'test@example.com').count('* as total')
    assert.equal(Number(total[0].$extras.total), 1)
  })

  test('should save the transaction in the database', async ({ client, assert }) => {
    const product = await Product.create({ name: 'Produto W', amount: 750 })

    await client.post('/purchases').json({ ...validPayload, productId: product.id })

    const transaction = await Transaction.query().first()
    assert.isNotNull(transaction)
    assert.equal(transaction!.amount, 750 * 2)
    assert.equal(transaction!.status, 'paid')
  })

  test('should return 404 when product does not exist', async ({ client }) => {
    const response = await client.post('/purchases').json({ ...validPayload, productId: 99999 })
    response.assertStatus(404)
  })

  test('should return 422 when productId is missing', async ({ client }) => {
    const response = await client.post('/purchases').json({
      quantity: 2,
      client: { name: 'Test', email: 'test@example.com' },
      card: { number: '5569000000006063', cvv: '010' },
    })
    response.assertStatus(422)
  })

  test('should return 422 when quantity is missing', async ({ client }) => {
    const product = await Product.create({ name: 'Prod', amount: 100 })
    const response = await client.post('/purchases').json({
      productId: product.id,
      client: { name: 'Test', email: 'test@example.com' },
      card: { number: '5569000000006063', cvv: '010' },
    })
    response.assertStatus(422)
  })

  test('should return 422 when client email is invalid', async ({ client }) => {
    const product = await Product.create({ name: 'Prod', amount: 100 })
    const response = await client.post('/purchases').json({
      ...validPayload,
      productId: product.id,
      client: { name: 'Test', email: 'not-an-email' },
    })
    response.assertStatus(422)
  })

  test('should return 422 when card number has wrong length', async ({ client }) => {
    const product = await Product.create({ name: 'Prod', amount: 100 })
    const response = await client.post('/purchases').json({
      ...validPayload,
      productId: product.id,
      card: { number: '1234', cvv: '010' },
    })
    response.assertStatus(422)
  })

  test('should return 422 when all gateways fail', async ({ client, assert }) => {
    const product = await Product.create({ name: 'Prod', amount: 100 })

    app.container.swap(GatewayService, () => new FailingGatewayService())

    const response = await client
      .post('/purchases')
      .json({ ...validPayload, productId: product.id })

    response.assertStatus(422)
    assert.equal(response.body().message, 'Payment could not be processed')
  })
})
