import vine from '@vinejs/vine'

export const createProductValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  amount: vine.number().positive().withoutDecimals(),
})

export const updateProductValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255).optional(),
  amount: vine.number().positive().withoutDecimals().optional(),
})
