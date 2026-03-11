import { test } from '@japa/runner'
import User from '#models/user'

test.group('Auth - Login', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should login with valid credentials and return token', async ({ client, assert }) => {
    await User.create({
      email: 'admin@betalent.tech',
      password: 'secret123',
    })

    const response = await client.post('/login').json({
      email: 'admin@betalent.tech',
      password: 'secret123',
    })

    response.assertStatus(200)

    const body = response.body()
    assert.property(body, 'token')
    assert.property(body, 'user')
    assert.equal(body.user.email, 'admin@betalent.tech')
  })

  test('should return 422 when email is missing', async ({ client }) => {
    const response = await client.post('/login').json({
      password: 'secret123',
    })

    response.assertStatus(422)
  })

  test('should return 422 when password is missing', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'admin@betalent.tech',
    })

    response.assertStatus(422)
  })

  test('should return 400 with invalid password', async ({ client }) => {
    await User.create({
      email: 'admin@betalent.tech',
      password: 'secret123',
    })

    const response = await client.post('/login').json({
      email: 'admin@betalent.tech',
      password: 'wrong_password',
    })

    response.assertStatus(400)
  })

  test('should return 400 with non-existent email', async ({ client }) => {
    const response = await client.post('/login').json({
      email: 'nonexistent@betalent.tech',
      password: 'secret123',
    })

    response.assertStatus(400)
  })
})

test.group('Auth - Protected routes', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
  })

  test('should access protected route with valid token', async ({ client, assert }) => {
    const user = await User.create({
      email: 'admin@betalent.tech',
      password: 'secret123',
    })

    const response = await client.post('/logout').loginAs(user)

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.message, 'Logged out successfully')
  })

  test('should return 401 when accessing protected route without token', async ({ client }) => {
    const response = await client.post('/logout')

    response.assertStatus(401)
  })

  test('should return 401 with invalid token', async ({ client }) => {
    const response = await client
      .post('/logout')
      .header('Authorization', 'Bearer invalid_token_here')

    response.assertStatus(401)
  })
})
