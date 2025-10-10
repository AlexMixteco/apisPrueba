const { text } = require('express');
const {Pool} = require ('pg');

const pool = new Pool({
  user: process.env.USER,
  password: process.env.PASS,
  host: process.env.HOST,
  port: 5432,
  database: process.env.DATABASE,
 ssl: {
  require: true,
 }
});

module.exports ={
    query:(text,params) => pool.query(text,params)
};  