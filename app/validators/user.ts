import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const createUserValidator = vine.create({
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
})

export const updateUserValidator = vine.create({
  email: email().optional(),
  password: password().optional(),
})
