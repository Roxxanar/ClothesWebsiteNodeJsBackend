
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();


const corsOptions = {
  origin: 'http://localhost:4200', // The address of the Angular frontend
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use(express.json());

// Create a connection to MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Default user, change if necessary
  password: '', // Default password, change if necessary
  database: 'mango' // Name of your database
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Create an API endpoint to fetch users
app.get('/clothing', (req, res) => {
  db.query('SELECT * FROM ClothingID', (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
