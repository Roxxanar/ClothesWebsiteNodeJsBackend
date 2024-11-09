const express = require('express');
const mysql = require('mysql');
const { ApolloServer, gql } = require('apollo-server-express');
const jwt = require('jsonwebtoken');

// Initialize Express and MySQL
const app = express();
const SECRET_KEY = 'your_secret_key';

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200', // Allow requests from Angular frontend
}));


// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mango'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// GraphQL Schema
const typeDefs = gql`
  type Clothing {
    ID: Int!
    Name: String
    Photo: String
    Price: Float
    Color: String
    Size: String
  }

  type AllClothes {
    AllClothesID: Int!
    IsNew: Boolean
    IsAtSale: Boolean
    Clothing: Clothing
    Shoes: Clothing
    Bags: Clothing
    Accessories: Clothing
  }

  type Query {
    allClothing: [Clothing]
    allClothesNew: [AllClothes]
    protectedData: String
  }

  type Mutation {
    login(email: String!, password: String!): String
  }
`;

// Resolvers
const resolvers = {
  Query: {
    allClothing: async () => {
      const query = 'SELECT * FROM Clothing';
      return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    },

    allClothesNew: async () => {
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
          s.Name AS ShoesName,
          s.Photo AS ShoesPhoto,
          s.Price AS ShoesPrice,
          s.Color AS ShoesColor,
          s.Size AS ShoesSize,
          b.ID AS BagsID,
          b.Name AS BagsName,
          b.Photo AS BagsPhoto,
          b.Price AS BagsPrice,
          b.Color AS BagsColor,
          b.Size AS BagsSize,
          a.ID AS AccessoriesID,
          a.Name AS AccessoriesName,
          a.Photo AS AccessoriesPhoto,
          a.Price AS AccessoriesPrice,
          a.Color AS AccessoriesColor,
          a.Size AS AccessoriesSize
        FROM AllClothes ac
        LEFT JOIN ClothingID c ON ac.ClothingID = c.ID
        LEFT JOIN ShoesID s ON ac.ShoesID = s.ID
        LEFT JOIN BagsID b ON ac.BagsID = b.ID
        LEFT JOIN AccessoriesID a ON ac.AccessoriesID = a.ID
        WHERE ac.IsNew = 1;
      `;
      return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(
            results.map(row => ({
              AllClothesID: row.AllClothesID,
              IsNew: row.IsNew,
              IsAtSale: row.IsAtSale,
              Clothing: {
                ID: row.ClothingID,
                Name: row.ClothingName,
                Photo: row.ClothingPhoto,
                Price: row.ClothingPrice,
                Color: row.ClothingColor,
                Size: row.ClothingSize,
              },
              Shoes: {
                ID: row.ShoesID,
                Name: row.ShoesName,
                Photo: row.ShoesPhoto,
                Price: row.ShoesPrice,
                Color: row.ShoesColor,
                Size: row.ShoesSize,
              },
              Bags: {
                ID: row.BagsID,
                Name: row.BagsName,
                Photo: row.BagsPhoto,
                Price: row.BagsPrice,
                Color: row.BagsColor,
                Size: row.BagsSize,
              },
              Accessories: {
                ID: row.AccessoriesID,
                Name: row.AccessoriesName,
                Photo: row.AccessoriesPhoto,
                Price: row.AccessoriesPrice,
                Color: row.AccessoriesColor,
                Size: row.AccessoriesSize,
              },
            }))
          );
        });
      });
    },

    protectedData: (parent, args, context) => {
      if (!context.user) {
        throw new Error("Authentication required");
      }
      return "This is protected data accessible only to authenticated users.";
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
          if (err) reject(err);
          else resolve(results[0]);
        });
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    }
  },
};

// Context function for authentication
const context = ({ req }) => {
  const token = req.headers.authorization || '';
  try {
    const user = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    return { user };
  } catch (error) {
    return {};
  }
};

// Initialize Apollo Server
const server = new ApolloServer({ typeDefs, resolvers, context });
//await server.start();
//server.applyMiddleware({ app });

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`GraphQL Server is running on http://localhost:${port}${server.graphqlPath}`);
});

startServer();
