const express = require('express');
const app = express.Router();
const jwt = require('jsonwebtoken');
const { UserData, CartProduct } = require('./databaseConnection');
// Now you can use userEmail in this file
// let getU=getUserEmail()
// console.log("userEmail is ", getU);


app.post('/cartItems', async (req, res) => {
    // Check if the user is logged in by inspecting the cookie
    const { newCartData, usertoken } = req.body;
    try {
        if (newCartData && usertoken) {
            console.log('empty then what..')
            let actualInfo = jwt.decode(usertoken.token);
            let email = actualInfo.email;
            const db1 = await UserData();
            const user = await db1.findOne({ Email: email });
            if (user) { 
                const db2 = await CartProduct();
                let cartUser = await db2.findOne({ UserEmail: email })
                if (cartUser) {
                    console.log(" i m here ", newCartData)
                    db2.updateOne({ UserEmail: email }, { $set: { Cart: newCartData } });
                }
 
                else
                    db2.insertOne({ UserEmail: email, Cart: newCartData })

                    res.send("success")
            }


        } else {
            // User is not logged in  
            res.send('Fail');
        }
    }
    catch (err) {
        res.send(err)
    }

});



app.post('/getCartDetails', async (req, res) => {
    try {
        let data = req.body;
        console.log(data, "data is ")
        let actualInfo = jwt.decode(data.token);
        let email = actualInfo.email
        const db = await CartProduct()
        let cart = await db.findOne({ UserEmail: email })
        let getcartfromJson = cart.Cart
        if (getcartfromJson)
            res.send(getcartfromJson)
        else
            res.send("not found")
    }
    catch (err) {
        console.log(err) 
    }
});





module.exports = app;