
// const hostname = '127.0.0.1';

const express = require('express');
const app = express();
const port = 5000; // Choose a port for your backend
// const authRoutes = require('./routes/authRoutes');
const authRoutes= require('./routes/authRoutes');
var cors = require('cors')
const cookieParser = require('cookie-parser');
const CartAndTransaction = require("./routes/CartAndTransaction")
const IdentityData  = require("./routes/IdentityData")
app.use(cookieParser())
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}))


app.use('/auth', authRoutes);
app.use('/paymentAndCart', CartAndTransaction);
app.use('/identity', IdentityData);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});