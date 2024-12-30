
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = '2000';


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


// POST /signup route to register a new user
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Check if email already exists in the database
  const checkUserQuery = 'SELECT * FROM users WHERE `E-mail` = ?';
  db.query(checkUserQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking user existence:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // If email doesn't exist, insert the new user
    const insertQuery = 'INSERT INTO users (`E-mail`, `Password`) VALUES (?, ?)';
    db.query(insertQuery, [email, password], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});


// POST /login route to authenticate user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email exists in the database
  const checkUserQuery = 'SELECT * FROM users WHERE `E-mail` = ? AND `Password` = ?';
  db.query(checkUserQuery, [email, password], (err, result) => {
    if (err) {
      console.error('Error checking user login:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    // If passwords are hashed, verify them (optional)
    // bcrypt.compare(password, user.Password, (err, isMatch) => {
    //   if (err) return res.status(500).json({ error: 'Internal Server Error' });
    //   if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // Generate a JWT token
    const token = 123;
    //const token = jwt.sign({ userId: user.id, email: user['E-mail'] }, JWT_SECRET, { expiresIn: '1h' });


    // User found, authentication successful
    res.status(200).json({ message: 'Login successful', token, username: user['First Name'] });
  });
});


// POST /usersubscribed route
app.post('/usersubscribed', (req, res) => {
  const { email } = req.body;  // Extract email from request body

  const checkUserSubQuery = 'SELECT * FROM users WHERE `E-mail` = ?';
  db.query(checkUserSubQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking user existence:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      if (result[0].IsSubscribed === 1) {
        return res.status(200).json({ message: 'You are already subscribed' });
      } else {
        const updateQuery = 'UPDATE users SET `IsSubscribed` = 1 WHERE `E-mail` = ?';
        db.query(updateQuery, [email], (err) => {
          if (err) {
            console.error('Error updating subscription:', err);
            return res.status(500).json({ error: 'Existing user not subscribed Error' });
          }
          return res.status(200).json({ message: 'You are now subscribed' });
        });
      }
    } else {
      const insertQuery = 'INSERT INTO users (`E-mail`, `IsSubscribed`) VALUES (?, 1)';
      db.query(insertQuery, [email], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ error: 'New user not subscribed Error' });
        }
        return res.status(201).json({ message: 'User subscribed successfully' });
      });
    }
  });
});







// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
