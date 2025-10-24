const { text } = require('express');
const { Pool } = require('pg');
//require('dotenv').config(); 

const pool = new Pool({
  user: 'postgres' ,
  password: '123' ,
  host:'localhost' ,
  database: 'grupo_EB' ,
  port: 5432,
  // ssl: {
  //  require : true
  // }
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
