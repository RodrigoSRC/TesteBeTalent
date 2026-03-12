/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  accessToken: {
    store: typeof routes['access_token.store']
    destroy: typeof routes['access_token.destroy']
  }
  user: {
    index: typeof routes['user.index']
    show: typeof routes['user.show']
    store: typeof routes['user.store']
    update: typeof routes['user.update']
    destroy: typeof routes['user.destroy']
  }
  product: {
    index: typeof routes['product.index']
    show: typeof routes['product.show']
    store: typeof routes['product.store']
    update: typeof routes['product.update']
    destroy: typeof routes['product.destroy']
  }
}
