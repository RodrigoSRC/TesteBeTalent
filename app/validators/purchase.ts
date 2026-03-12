import vine from '@vinejs/vine'

export const createPurchaseValidator = vine.compile(
  vine.object({
    productId: vine.number().positive().withoutDecimals(),
    quantity: vine.number().positive().withoutDecimals(),
    client: vine.object({
      name: vine.string().trim().minLength(1).maxLength(255),
      email: vine.string().email().maxLength(254),
    }),
    card: vine.object({
      number: vine.string().minLength(16).maxLength(16),
      cvv: vine.string().minLength(3).maxLength(4),
    }),
  })
)
