import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayService } from '#services/gateway/gateway_service'

class MockGatewayService extends GatewayService {
  constructor() {
    super(new Map())
  }
}

async function getAuthUser() {
  return User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

async function createFixture() {
  const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
  const client = await Client.create({ name: 'Test User', email: 'test@example.com' })
  const product = await Product.create({ name: 'Produto X', amount: 1990 })
  return { gateway, client, product }
}

test.group('GET /transactions', (group) => {
  group.each.setup(async () => {
    await Transaction.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Gateway.query().delete()
    await User.query().delete()

    app.container.swap(GatewayService, () => new MockGatewayService())
    return () => app.container.restore(GatewayService)
  })

  test('should list all transactions with related data', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const { gateway, client: buyer, product } = await createFixture()

    await Transaction.create({
      clientId: buyer.id,
      gatewayId: gateway.id,
      productId: product.id,
      quantity: 2,
      externalId: 'ext-001',
      status: 'paid',
      amount: 3980,
      cardLastNumbers: '6063',
    })

    const response = await client.get('/transactions').loginAs(admin)

    response.assertStatus(200)
    const body = response.body()
    assert.isArray(body)
    assert.lengthOf(body, 1)
    assert.equal(body[0].amount, 3980)
    assert.equal(body[0].status, 'paid')
    assert.equal(body[0].client.email, 'test@example.com')
    assert.equal(body[0].gateway.name, 'Gateway 1')
    assert.equal(body[0].product.name, 'Produto X')
  })

  test('should return an empty array when there are no transactions', async ({
    client,
    assert,
  }) => {
    const admin = await getAuthUser()

    const response = await client.get('/transactions').loginAs(admin)

    response.assertStatus(200)
    assert.deepEqual(response.body(), [])
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.get('/transactions')
    response.assertStatus(401)
  })
})

test.group('GET /transactions/:id', (group) => {
  group.each.setup(async () => {
    await Transaction.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Gateway.query().delete()
    await User.query().delete()

    app.container.swap(GatewayService, () => new MockGatewayService())
    return () => app.container.restore(GatewayService)
  })

  test('should return transaction detail with client, gateway and product', async ({
    client,
    assert,
  }) => {
    const admin = await getAuthUser()
    const { gateway, client: buyer, product } = await createFixture()

    const tx = await Transaction.create({
      clientId: buyer.id,
      gatewayId: gateway.id,
      productId: product.id,
      quantity: 1,
      externalId: 'ext-002',
      status: 'paid',
      amount: 1990,
      cardLastNumbers: '1234',
    })

    const response = await client.get(`/transactions/${tx.id}`).loginAs(admin)

    response.assertStatus(200)
    const body = response.body()
    assert.equal(body.id, tx.id)
    assert.equal(body.amount, 1990)
    assert.equal(body.externalId, 'ext-002')
    assert.equal(body.cardLastNumbers, '1234')
    assert.equal(body.quantity, 1)
    assert.equal(body.client.name, 'Test User')
    assert.equal(body.gateway.name, 'Gateway 1')
    assert.equal(body.product.name, 'Produto X')
  })

  test('should return 404 for non-existent transaction', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.get('/transactions/99999').loginAs(admin)
    response.assertStatus(404)
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.get('/transactions/1')
    response.assertStatus(401)
  })
})
