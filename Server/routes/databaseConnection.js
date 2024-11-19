const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'SoulinHeart';


async function UserData() {
  try {
    let conn = await client.connect();
    console.log('Connected successfully to server');
    const db = conn.db(dbName);
    return db.collection('User_Data');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // or handle the error appropriately
  }
}

async function CartProduct() {
  try {
    let conn = await client.connect();
    console.log('Connected successfully to server');
    const db = conn.db(dbName);
    return db.collection('CartProduct');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; 
  }
}

async function Identity() {
  try {
    let conn = await client.connect();
    console.log('Connected successfully to server');
    const db = conn.db(dbName);
    return db.collection('Identity');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

module.exports = { UserData, CartProduct, Identity };