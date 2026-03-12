import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

/**
 * Rotas públicas
 */
router.post('/login', [controllers.AccessToken, 'store'])
router.post('/purchases', [controllers.Purchase, 'store'])

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

    // Transações
    router.get('/transactions', [controllers.Transaction, 'index'])
    router.get('/transactions/:id', [controllers.Transaction, 'show'])
    router.post('/transactions/:id/refund', [controllers.Transaction, 'refund'])

    // Gateways
    router.patch('/gateways/:id/toggle', [controllers.Gateway, 'toggle'])
    router.patch('/gateways/:id/priority', [controllers.Gateway, 'priority'])
  })
  .use(middleware.auth())
