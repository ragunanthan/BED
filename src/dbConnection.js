import mysql from 'mysql2';

 export const dbConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port : process.env.MYSQL_PORT,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

export const dbconnect = dbConnection.promise();
