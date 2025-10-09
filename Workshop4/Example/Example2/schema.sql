CREATE TABLE users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

     username TEXT UNIQUE NOT NULL,

     password_hash TEXT NOT NULL,

     avatar TEXT

);

  

CREATE TABLE pages (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT UNIQUE NOT NULL,

    content TEXT NOT NULL

);