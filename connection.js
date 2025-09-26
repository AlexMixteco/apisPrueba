const { text } = require('express');
const {Pool} = require ('pg');

const pool = new Pool({
    user: 'postgres',
    password: '123',
    host: 'localhost',
    port: 5432,
    database: 'grupo_EB',
    ssl:true

});

module.exports ={
    query:(text,params) => pool.query(text,params)
};