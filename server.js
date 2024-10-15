
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

// Create an API endpoint to fetch users
app.get('/allclothesnew', (req, res) => {

  const query = `
    SELECT 
      ac.ID AS AllClothesID,
      ac.IsNew,
      ac.IsAtSale,
      c.ID AS ClothingID,
      c.Name AS ClothingName,
      c.Photo AS ClothingPhoto,
      c.Price AS ClothingPrice,
      c.Color AS ClothingColor,
      c.Size AS ClothingSize,

      s.ID AS ShoesID,
      s.Name AS ShoesName,           -- Changed alias
      s.Photo AS ShoesPhoto,         -- Changed alias
      s.Price AS ShoesPrice,         -- Changed alias
      s.Color AS ShoesColor,         -- Changed alias
      s.Size AS ShoesSize,           -- Changed alias
    
      b.ID AS BagsID,
      b.Name AS BagsName,            -- Changed alias
      b.Photo AS BagsPhoto,          -- Changed alias
      b.Price AS BagsPrice,          -- Changed alias
      b.Color AS BagsColor,          -- Changed alias
      b.Size AS BagsSize,            -- Changed alias
    
      a.ID AS AccessoriesID,
      a.Name AS AccessoriesName,     -- Changed alias
      a.Photo AS AccessoriesPhoto,   -- Changed alias
      a.Price AS AccessoriesPrice,    -- Changed alias
      a.Color AS AccessoriesColor,    -- Changed alias
      a.Size AS AccessoriesSize       -- Changed alias

    FROM AllClothes ac
    LEFT JOIN ClothingID c ON ac.ClothingID = c.ID
    LEFT JOIN ShoesID s ON ac.ShoesID = s.ID
    LEFT JOIN BagsID b ON ac.BagsID = b.ID
    LEFT JOIN AccessoriesID a ON ac.AccessoriesID = a.ID
    WHERE ac.IsNew = 1;
  `;


  db.query(query, (err, results) => {
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
