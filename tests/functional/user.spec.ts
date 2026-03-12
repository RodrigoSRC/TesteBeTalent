import { test } from '@japa/runner'
import User from '#models/user'

// Helper para autenticar
async function getAuthUser() {
  return await User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

test.group('User CRUD', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should create user', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const response = await client
      .post('/users')
      .json({
        email: 'user@betalent.tech',
        password: 'secret123',
      })
      .loginAs(admin)

    response.assertStatus(201)
    assert.equal(response.body().email, 'user@betalent.tech')
  })

  test('should list users', async ({ client, assert }) => {
    const admin = await getAuthUser()
    await User.create({ email: 'user1@betalent.tech', password: 'pass1' })
    await User.create({ email: 'user2@betalent.tech', password: 'pass2' })

    const response = await client.get('/users').loginAs(admin)
    response.assertStatus(200)
    assert.isArray(response.body())
    assert.lengthOf(response.body(), 3) // admin + 2
  })

  test('should show user by id', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const user = await User.create({ email: 'user@betalent.tech', password: 'pass' })
    const response = await client.get(`/users/${user.id}`).loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().email, 'user@betalent.tech')
  })

  test('should update user', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const user = await User.create({ email: 'user@betalent.tech', password: 'pass' })
    const response = await client
      .put(`/users/${user.id}`)
      .json({
        email: 'updated@betalent.tech',
      })
      .loginAs(admin)
    response.assertStatus(200)
    assert.equal(response.body().email, 'updated@betalent.tech')
  })

  test('should delete user', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const user = await User.create({ email: 'user@betalent.tech', password: 'pass' })
    const response = await client.delete(`/users/${user.id}`).loginAs(admin)
    response.assertStatus(204)
    const deleted = await User.find(user.id)
    assert.isNull(deleted)
  })

  test('should return 404 for non-existent user', async ({ client }) => {
    const admin = await getAuthUser()
    const response = await client.get('/users/999').loginAs(admin)
    response.assertStatus(404)
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.get('/users')
    response.assertStatus(401)
  })
})
