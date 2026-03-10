import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class UserSeeder extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await User.updateOrCreate(
      { email: 'admin@betalent.tech' },
      {
        email: 'admin@betalent.tech',
        password: 'secret123',
        role: 'admin',
      }
    )
  }
}
