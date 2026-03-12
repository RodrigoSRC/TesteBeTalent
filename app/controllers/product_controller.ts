import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'

export default class ProductController {
  async index({ response }: HttpContext) {
    const products = await Product.all()
    return response.ok(products)
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })
    return response.ok(product)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    const product = await Product.create(payload)
    return response.created(product)
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })
    const payload = await request.validateUsing(updateProductValidator)
    product.merge(payload)
    await product.save()
    return response.ok(product)
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })
    await product.delete()
    return response.noContent()
  }
}
