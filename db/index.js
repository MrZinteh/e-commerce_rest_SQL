const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'commerce2',
    password: 'pass1234',
    port: 5432,
  })


module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}