const { Client } = require('pg');

require('dotenv').config();  // To load environment variables
// Replace the connection string with your Supabase connection URL
const client = new Client({
  connectionString: process.env.SUPABASE_DATABASE_URL,
});

console.log(process.env.SUPABASE_DATABASE_URL);  // Check if the URL is printed


client.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });
