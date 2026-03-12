/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'access_token.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['access_token.store']['types'],
  },
  'purchase.store': {
    methods: ["POST"],
    pattern: '/purchases',
    tokens: [{"old":"/purchases","type":0,"val":"purchases","end":""}],
    types: placeholder as Registry['purchase.store']['types'],
  },
  'access_token.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['access_token.destroy']['types'],
  },
  'user.index': {
    methods: ["GET","HEAD"],
    pattern: '/users',
    tokens: [{"old":"/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['user.index']['types'],
  },
  'user.show': {
    methods: ["GET","HEAD"],
    pattern: '/users/:id',
    tokens: [{"old":"/users/:id","type":0,"val":"users","end":""},{"old":"/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.show']['types'],
  },
  'user.store': {
    methods: ["POST"],
    pattern: '/users',
    tokens: [{"old":"/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['user.store']['types'],
  },
  'user.update': {
    methods: ["PUT"],
    pattern: '/users/:id',
    tokens: [{"old":"/users/:id","type":0,"val":"users","end":""},{"old":"/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.update']['types'],
  },
  'user.destroy': {
    methods: ["DELETE"],
    pattern: '/users/:id',
    tokens: [{"old":"/users/:id","type":0,"val":"users","end":""},{"old":"/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user.destroy']['types'],
  },
  'product.index': {
    methods: ["GET","HEAD"],
    pattern: '/products',
    tokens: [{"old":"/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['product.index']['types'],
  },
  'product.show': {
    methods: ["GET","HEAD"],
    pattern: '/products/:id',
    tokens: [{"old":"/products/:id","type":0,"val":"products","end":""},{"old":"/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['product.show']['types'],
  },
  'product.store': {
    methods: ["POST"],
    pattern: '/products',
    tokens: [{"old":"/products","type":0,"val":"products","end":""}],
    types: placeholder as Registry['product.store']['types'],
  },
  'product.update': {
    methods: ["PUT"],
    pattern: '/products/:id',
    tokens: [{"old":"/products/:id","type":0,"val":"products","end":""},{"old":"/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['product.update']['types'],
  },
  'product.destroy': {
    methods: ["DELETE"],
    pattern: '/products/:id',
    tokens: [{"old":"/products/:id","type":0,"val":"products","end":""},{"old":"/products/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['product.destroy']['types'],
  },
  'client.index': {
    methods: ["GET","HEAD"],
    pattern: '/clients',
    tokens: [{"old":"/clients","type":0,"val":"clients","end":""}],
    types: placeholder as Registry['client.index']['types'],
  },
  'client.show': {
    methods: ["GET","HEAD"],
    pattern: '/clients/:id',
    tokens: [{"old":"/clients/:id","type":0,"val":"clients","end":""},{"old":"/clients/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['client.show']['types'],
  },
  'transaction.index': {
    methods: ["GET","HEAD"],
    pattern: '/transactions',
    tokens: [{"old":"/transactions","type":0,"val":"transactions","end":""}],
    types: placeholder as Registry['transaction.index']['types'],
  },
  'transaction.show': {
    methods: ["GET","HEAD"],
    pattern: '/transactions/:id',
    tokens: [{"old":"/transactions/:id","type":0,"val":"transactions","end":""},{"old":"/transactions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['transaction.show']['types'],
  },
  'transaction.refund': {
    methods: ["POST"],
    pattern: '/transactions/:id/refund',
    tokens: [{"old":"/transactions/:id/refund","type":0,"val":"transactions","end":""},{"old":"/transactions/:id/refund","type":1,"val":"id","end":""},{"old":"/transactions/:id/refund","type":0,"val":"refund","end":""}],
    types: placeholder as Registry['transaction.refund']['types'],
  },
  'gateway.toggle': {
    methods: ["PATCH"],
    pattern: '/gateways/:id/toggle',
    tokens: [{"old":"/gateways/:id/toggle","type":0,"val":"gateways","end":""},{"old":"/gateways/:id/toggle","type":1,"val":"id","end":""},{"old":"/gateways/:id/toggle","type":0,"val":"toggle","end":""}],
    types: placeholder as Registry['gateway.toggle']['types'],
  },
  'gateway.priority': {
    methods: ["PATCH"],
    pattern: '/gateways/:id/priority',
    tokens: [{"old":"/gateways/:id/priority","type":0,"val":"gateways","end":""},{"old":"/gateways/:id/priority","type":1,"val":"id","end":""},{"old":"/gateways/:id/priority","type":0,"val":"priority","end":""}],
    types: placeholder as Registry['gateway.priority']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
