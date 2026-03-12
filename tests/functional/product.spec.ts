import { test } from '@japa/runner'
import User from '#models/user'
import Product from '#models/product'

// Helper para autenticar
async function getAuthUser() {
  return await User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

test.group('Product CRUD', (group) => {
  group.each.setup(async () => {
    await Product.query().delete()
    await User.query().delete()
  })

  test('should create product', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const response = await client
      .post('/products')
      .json({
        name: 'Produto Teste',
        amount: 1990,
      })
      .loginAs(admin)

    response.assertStatus(201)
    assert.equal(response.body().name, 'Produto Teste')
    assert.equal(response.body().amount, 1990)
  })

  test('should list products', async ({ client, assert }) => {
    const admin = await getAuthUser()
    await Product.createMany([
      { name: 'Produto A', amount: 500 },
      { name: 'Produto B', amount: 1000 },
    ])

    const response = await client.get('/products').loginAs(admin)
    response.assertStatus(200)
    assert.isArray(response.body())
    assert.lengthOf(response.body(), 2)
  })

  test('should show product by id', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const product = await Product.create({ name: 'Produto C', amount: 750 })

    const response = await client.get(`/products/${product.id}`).loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().name, 'Produto C')
    assert.equal(response.body().amount, 750)
  })

  test('should update product', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const product = await Product.create({ name: 'Produto Velho', amount: 300 })

    const response = await client
      .put(`/products/${product.id}`)
      .json({ name: 'Produto Novo', amount: 600 })
      .loginAs(admin)

    response.assertStatus(200)
    assert.equal(response.body().name, 'Produto Novo')
    assert.equal(response.body().amount, 600)
  })

  test('should delete product', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const product = await Product.create({ name: 'Para Deletar', amount: 100 })

    const response = await client.delete(`/products/${product.id}`).loginAs(admin)
    response.assertStatus(204)

    const deleted = await Product.find(product.id)
    assert.isNull(deleted)
  })

  test('should return 404 for non-existent product', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.get('/products/999').loginAs(admin)
    response.assertStatus(404)
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.get('/products')
    response.assertStatus(401)
  })

  test('should reject invalid amount (negative)', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client
      .post('/products')
      .json({ name: 'Produto Inválido', amount: -50 })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('should reject missing name', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.post('/products').json({ amount: 500 }).loginAs(admin)

    response.assertStatus(422)
  })
})
