import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'

export default class UserController {
  async index({ response }: HttpContext) {
    const users = await User.all()
    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    return response.ok(user)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create(payload)
    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    const payload = await request.validateUsing(updateUserValidator)
    user.merge(payload)
    await user.save()
    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })
    await user.delete()
    return response.noContent()
  }
}
