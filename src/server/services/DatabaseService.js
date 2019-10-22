const flatfile = require("flat-file-db");

class Database {
  constructor(file) {
    this.file =
      process.platform == "win32"
        ? `${__dirname}\\..\\..\\..\\database\\${file}.db`
        : `${__dirname}/../../../database/${file}.db`;
  }

  get(key) {
    const db = flatfile.sync(this.file);
    const data = db.get(key);
    db.close();
    return data;
  }

  put(key, value) {
    const db = flatfile.sync(this.file);
    db.put(key, value);
    db.close();
  }

  remove(key) {
    const db = flatfile.sync(this.file);
    db.del(key);
    db.close();
  }

  has(key) {
    const db = flatfile.sync(this.file);
    const has = db.has(key);
    db.close();
    return has;
  }

  keys() {
    const db = flatfile.sync(this.file);
    const keys = db.keys();
    db.close();
    return keys;
  }

  clear() {
    const db = flatfile.sync(this.file);
    db.clear();
    db.close();
  }
}

module.exports = Database;
