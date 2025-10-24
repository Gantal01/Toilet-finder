const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'osm_hungary',
  password: 'asdf',
  port: 5432,
});

module.exports = pool;