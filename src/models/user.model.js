// Simulación de base de datos (reemplaza con tu DB real: MongoDB, MySQL, etc.)
const bcrypt = require('bcryptjs');

const users = [];

const UserModel = {

  async create(email, password, role = 'user') {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, passwordHash, role };
    users.push(user);
    return user;
  },

  async findByEmail(email) {
    return users.find(u => u.email === email) || null;
  },

  findById(id) {
    return users.find(u => u.id === id) || null;
  }

};

module.exports = UserModel;