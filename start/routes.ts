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
    // CRUD Usuários
    router.get('/users', [controllers.User, 'index'])
    router.get('/users/:id', [controllers.User, 'show'])
    router.post('/users', [controllers.User, 'store'])
    router.put('/users/:id', [controllers.User, 'update'])
    router.delete('/users/:id', [controllers.User, 'destroy'])

    // CRUD Produtos
    router.get('/products', [controllers.Product, 'index'])
    router.get('/products/:id', [controllers.Product, 'show'])
    router.post('/products', [controllers.Product, 'store'])
    router.put('/products/:id', [controllers.Product, 'update'])
    router.delete('/products/:id', [controllers.Product, 'destroy'])

    // Clientes
    router.get('/clients', [controllers.Client, 'index'])
    router.get('/clients/:id', [controllers.Client, 'show'])
  })
  .use(middleware.auth())
