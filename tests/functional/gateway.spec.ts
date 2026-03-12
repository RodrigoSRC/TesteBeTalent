import { test } from '@japa/runner'
import User from '#models/user'
import Gateway from '#models/gateway'

async function getAuthUser() {
  return await User.create({ email: 'admin@betalent.tech', password: 'adminpass' })
}

test.group('PATCH /gateways/:id/toggle', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Gateway.query().delete()
  })

  test('should toggle gateway from active to inactive', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })

    const response = await client.patch(`/gateways/${gateway.id}/toggle`).loginAs(admin)

    response.assertStatus(200)
    assert.equal(response.body().id, gateway.id)
    assert.equal(response.body().isActive, false)
  })

  test('should toggle gateway from inactive to active', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: false, priority: 1 })

    const response = await client.patch(`/gateways/${gateway.id}/toggle`).loginAs(admin)

    response.assertStatus(200)
    assert.equal(response.body().isActive, true)
  })

  test('should return 404 for non-existent gateway', async ({ client }) => {
    const admin = await getAuthUser()

    const response = await client.patch('/gateways/999/toggle').loginAs(admin)

    response.assertStatus(404)
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.patch('/gateways/1/toggle')

    response.assertStatus(401)
  })
})

test.group('PATCH /gateways/:id/priority', (group) => {
  group.each.setup(async () => {
    await User.query().delete()
    await Gateway.query().delete()
  })

  test('should update gateway priority', async ({ client, assert }) => {
    const admin = await getAuthUser()
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .json({ priority: 5 })
      .loginAs(admin)

    response.assertStatus(200)
    assert.equal(response.body().id, gateway.id)
    assert.equal(response.body().priority, 5)
  })

  test('should return 404 for non-existent gateway', async ({ client }) => {
    const admin = await getAuthUser()

    const response = await client
      .patch('/gateways/999/priority')
      .json({ priority: 1 })
      .loginAs(admin)

    response.assertStatus(404)
  })

  test('should return 422 for invalid priority', async ({ client }) => {
    const admin = await getAuthUser()
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .json({ priority: -1 })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('should return 422 for non-integer priority', async ({ client }) => {
    const admin = await getAuthUser()
    const gateway = await Gateway.create({ name: 'Gateway 1', isActive: true, priority: 1 })

    const response = await client
      .patch(`/gateways/${gateway.id}/priority`)
      .json({ priority: 'abc' })
      .loginAs(admin)

    response.assertStatus(422)
  })

  test('should require authentication', async ({ client }) => {
    const response = await client.patch('/gateways/1/priority').json({ priority: 1 })

    response.assertStatus(401)
  })
})
