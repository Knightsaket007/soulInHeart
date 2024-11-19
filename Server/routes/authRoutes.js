
const express = require('express');
const app = express.Router();
const session = require('express-session');
const { UserData } = require('./databaseConnection');
const nodemailer = require('nodemailer');
// const cookieParser = require('cookie-parser');       
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate a random string of specified length
const generateRandomString = (length) => {
    return crypto.randomBytes(length).toString('hex');
};



// app.use(cookieParser());

//========== Session Initalise with time ==============//
const fiveMinutes = 1000 * 60 * 5;
app.use(session({
    secret: generateRandomString(32),
    saveUninitialized: true,
    cookie: { maxAge: fiveMinutes },
    resave: false
}))
//==========>>> Session Initalise with time <<<==============//



//========== OTP Generator ==============//
let characters = "1234567890";
let length = characters.length;
function otpGenerator() {
    let newOtp = ""
    for (let i = 1; i <= 6; i++) {
        let index = Math.floor(Math.random() * length);
        newOtp += characters[index];
    }
    // session.OTP_info = newOtp;
    return newOtp;
}
//==========>>> OTP Generator <<<==============//



//========== Mail Credintials==============//
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "indian.guys2022@gmail.com",
        pass: "xhhk rdbk nout rauj"
    }
});
//==========>>> Mail Credintials <<<==============//


//////////////===================SIGNUP CODE==========================////////////////////////
//////////////===================SIGNUP CODE==========================////////////////////////

//===========Check User and send Otp to Email===================//
app.post('/OtpGeneration', async (req, res) => {
    try {
        const { name, email, password } = req.body;


        console.log("email is ", email)

        const IsUserNotExist = async () => {
            const db = await UserData()
            return await db.findOne({ Email: email });
        }
        // Set session variables
        let a = await IsUserNotExist();
        console.log("respose is ", a)

        if (a === null) {
            let stringOtp = otpGenerator()
            const hashedPassword = await bcrypt.hash(password, 10);
            session.details = [name, email, hashedPassword];
            console.log("hashed password", hashedPassword)

            const options = {
                from: "indian.guys2022@gmail.com",
                to: email,
                subject: "",
                text: "Your OTP is: " + stringOtp
            }

            transport.sendMail(options, (err) => {
                if (err) {
                    console.log(err);

                } else {
                    res.send(["success", stringOtp])

                }
            });
            let encryptionKey = generateRandomString(10)
            res.send(["success", stringOtp, encryptionKey])
            console.log("otp is ", stringOtp)

        }
        else
            res.send(["user Exist", null])


        // res.status(200).json({ message: 'ok' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


//================= Insert User in Database ====================//

const generateToken = (userDetails) => {
    const secretKey = generateRandomString(32); // Change this to a strong, secret key
    const expiresIn = '2h'; // Token expiration time (e.g., 2 hours)

    return jwt.sign(userDetails, secretKey, { expiresIn });
};


app.post('/insertUser', async (req, res) => {
    try {
        let userdetails = session.details;
        let name = userdetails[0];
        let email = userdetails[1];
        let password = userdetails[2]
        const IsUserNotExist = async () => {
            const db = await UserData()
            return await db.findOne({ Email: email });
        }
        // Set session variables
        let a = await IsUserNotExist();
        if (a === null) {

            const insert = async () => {
                const db = await UserData();
                try {
                    await db.insertOne({ Name: name, Email: email, Password: password });

                } catch (insertError) {
                    console.error(insertError);
                    // Handle insertion error, and send an appropriate response to the client
                    res.status(500).json({ message: 'Error inserting user into the database' });
                }
            };

            await insert();

            const userDetails = {
                name: name,
                email: email,
                // Add other relevant user details
            };
            let token = generateToken(userDetails)
            console.log("inserted succes.....ok")

            res.json({ token });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

});



app.post('/check-auth', async (req, res) => {
    // Check if the user is logged in by inspecting the cookie
    const userCookie = req.body;
    try {
        if (userCookie && Object.keys(userCookie).length !== 0) {
            let actualInfo = await jwt.decode(userCookie.userCookie.token)
            const db = await UserData();
            const user = await db.findOne({ Email: actualInfo.email });
            if (user)
                res.send('success');
            else res.send("not found")

        } else {
            // User is not logged in
            res.send('Fail');
        }
    }
    catch (err) {
        res.send(err)
    }

});



//////////////<<<<=================== SIGNUP CODE END ==========================>>>////////////////////////
//////////////<<<<=================== SIGNUP CODE END ==========================>>>////////////////////////



/////////////======================== LOG IN =================================/////////////////
/////////////======================== LOG IN =================================/////////////////
/////////////======================== LOG IN =================================/////////////////



app.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;
        const db = await UserData()
        const user = await db.findOne({ Email: email });
        console.log("user exist or not ", user)
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.Password);
            if (passwordMatch) {
                const userDetails = {
                    name: user.Name,
                    email: email,
                    // Add other relevant user details
                };
                let token = generateToken(userDetails)
                console.log("inserted succes.....ok")

                res.json({ token });
            } else {
                // Passwords do not match, handle invalid credentials
                res.send('Invalid credentials');
            }
        }
        else
            res.send("User not found")

    }
    catch (err) {
        res.send("Something went wrong, please try again later")
    }
});


//////===============Change Password ===============////////

app.post('/checkuser', async (req, res) => {
    try {
        const { email, credential } = req.body;
        console.log("yes, the email is ", email, credential)
        let db = await UserData();
        let isuserexist
        if (credential) {
            let actualInfo = await jwt.decode(credential.token)
            let actualemail = actualInfo.email;
            console.log('actual info ..', actualemail)
            isuserexist = (actualemail === email) ? await db.findOne({ Email: email }) : null
        }
        else
            isuserexist = await db.findOne({ Email: email })
        console.log("isuserexist is", isuserexist)

        if (isuserexist) {
            session.holdEmail = email;
            let stringOtp = otpGenerator();
            let encryptionKey = generateRandomString(10)
            const options = {
                from: "indian.guys2022@gmail.com",
                to: email,
                subject: "",
                text: "Your OTP is: " + stringOtp
            }

            console.log(stringOtp, "stringOtp")

            transport.sendMail(options, (err) => {
                if (err) {
                    console.log(err);

                } else {
                    res.send(["success", stringOtp, encryptionKey,email])

                }
            });

        }
        else
            res.send(["notfound", null]);
    }
    catch (err) {
        console.log(err)
    }
})



app.post('/updatePassword', async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log("password id", password)
        let db = await UserData();
        let isuserexist = await db.findOne({ Email: email })
        if (isuserexist) {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.updateOne({ Email: email }, { $set: { Password: hashedPassword } });
            res.send("success")
        }
        else {
            res.send("something went wrong")
        }
    }
    catch (err) {
        console.log(err)
    }
})

// Export the router
module.exports = app;
// module.exports.userEmail = userEmail;