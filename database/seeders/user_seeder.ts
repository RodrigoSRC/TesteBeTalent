import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import env from '#start/env'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.updateOrCreate(
      { email: env.get('ADMIN_EMAIL') },
      {
        email: env.get('ADMIN_EMAIL'),
        password: env.get('ADMIN_PASSWORD'),
        role: 'admin',
      }
    )
  }
}
