import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

/**
 * Rotas públicas
 */
router.post('/login', [controllers.AccessToken, 'store'])

/**
 * Rotas protegidas (requerem autenticação via Bearer token)
 */
router
  .group(() => {
    router.post('/logout', [controllers.AccessToken, 'destroy'])
  })
  .use(middleware.auth())
