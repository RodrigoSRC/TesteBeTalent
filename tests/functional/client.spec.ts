import { test } from '@japa/runner'
import User from '#models/user'
import Client from '#models/client'
import Product from '#models/product'
import Gateway from '#models/gateway'
import Transaction from '#models/transaction'

async function getAuthUser() {
  return await User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

test.group('Client Listings', (group) => {
  group.each.setup(async () => {
    await Transaction.query().delete()
    await Client.query().delete()
    await Product.query().delete()
    await Gateway.query().delete()
    await User.query().delete()
  })

  test('should list all clients', async ({ client, assert }) => {
    const admin = await getAuthUser()
    await Client.createMany([
      { name: 'Cliente A', email: 'a@test.com' },
      { name: 'Cliente B', email: 'b@test.com' },
    ])
    const response = await client.get('/clients').loginAs(admin)
    response.assertStatus(200)
    assert.isArray(response.body())
    assert.lengthOf(response.body(), 2)
  })

  test('should show client detail with purchases', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const clientRecord = await Client.create({ name: 'Cliente C', email: 'c@test.com' })
    const product = await Product.create({ name: 'Produto Teste', amount: 1000 })
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })
    await Transaction.create({
      clientId: clientRecord.id,
      productId: product.id,
      gatewayId: gateway.id,
      quantity: 2,
      status: 'paid',
      amount: 2000,
      cardLastNumbers: '1234',
    })

    const response = await client.get(`/clients/${clientRecord.id}`).loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().name, 'Cliente C')
    assert.equal(response.body().email, 'c@test.com')
    assert.isArray(response.body().transactions)
    assert.lengthOf(response.body().transactions, 1)
    assert.equal(response.body().transactions[0].amount, 2000)
    assert.equal(response.body().transactions[0].quantity, 2)
  })

  test('should show client with no purchases', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const clientRecord = await Client.create({ name: 'Cliente Sem Compras', email: 'd@test.com' })
    const response = await client.get(`/clients/${clientRecord.id}`).loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().name, 'Cliente Sem Compras')
    assert.isArray(response.body().transactions)
    assert.lengthOf(response.body().transactions, 0)
  })

  test('should return 404 for non-existent client', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.get('/clients/999999').loginAs(admin)
    response.assertStatus(404)
  })

  test('should require authentication to list clients', async ({ client }) => {
    const response = await client.get('/clients')
    response.assertStatus(401)
  })

  test('should require authentication to show client', async ({ client }) => {
    const response = await client.get('/clients/1')
    response.assertStatus(401)
  })
})
