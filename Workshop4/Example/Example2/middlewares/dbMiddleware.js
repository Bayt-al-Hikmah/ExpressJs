const sqlite3 = require('sqlite3').verbose();

module.exports = function () {
  return (req, res, next) => {
    if (!req.app.get('db')) {
      const db = new sqlite3.Database('database.db', (err) => {
        if (err) {
          console.error('Failed to connect to SQLite:', err);
          return next(err);
        }
        console.log('Connected to SQLite database');
      });

      req.app.set('db', db);

      const closeDb = () => {
        const db = req.app.get('db');
        if (db) {
          db.close((err) => {
            if (err) {
              console.error('Failed to close SQLite:', err);
            } else {
              console.log('SQLite database connection closed');
            }
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      };

      // Handle process termination signals
      process.on('SIGINT', closeDb);
      process.on('SIGTERM', closeDb);
    }
    next();
  };
};