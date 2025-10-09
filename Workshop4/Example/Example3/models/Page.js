class Page {
  static async create(db, title, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO pages (title, content) VALUES (?, ?)',
        [title, content],
        function (err) {
          if (err) reject(err)
          resolve()
        }
      )
    })
  }

  static async findByTitle(db, title) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM pages WHERE title = ?', [title], (err, row) => {
        if (err) reject(err)
        resolve(row)
      })
    })
  }
}

module.exports = Page