const argon2 = require('argon2')
class User {
  static async create(db, username, password) {
    const passwordHash = await argon2.hash(password)
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash], function (err) {
        if (err) reject(err)
        resolve()
      })
    })
  }

  static async findByUsername(db, username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  }
  static async updateAvatar(db, username, avatarFilename) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET avatar = ? WHERE username = ?',
        [avatarFilename, username],
        function (err) {
          if (err) reject(err)
          resolve()
        }
      )
    })
  }
}

module.exports = User