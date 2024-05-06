const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
var storedUser = null;




const app = express();

app.use(cors());
app.use(express.json());


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cartier',
    port: 3307
});

app.use(session({
    secret: 'cartier',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if your using https
  }));



app.post('/register', (req, res) => {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    con.query('INSERT INTO users (email, username, password) VALUES (?, ?, ?)', [email, username, password], (err, result) => {
        if(result) {
            res.send(result);
        }
        else{
            res.send({message: err});
        }
    });
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    con.query('SELECT * FROM users where username =? and password =?', [username, password], (err, result) => {
        if (err) {
            res.send({ err: err });
        } else {
            if (result.length > 0) {
                const user = result[0];
                
                console.log(user);

                res.send(user);
                // You can send this data to multiple pages by storing it in a session or a cookie.
                // Here's an example of using sessions to store the user data:

                req.session.user = user; // Store the user data in the session

                // Now you can access the user data on other pages by retrieving it from the session:
                storedUser = req.session.user;

                // You can also check if the user is logged in by checking if the session contains the user data:
                if (req.session.user) {
                    // User is logged in
                    console.log('User is logged in');
                } else {
                    // User is not logged ic
                    console.log('User is not logged in');
                }
            } else {
                res.send({ message: 'Wrong username/password combination!' });
            }

        }
    });
});

app.get('/some-page', (req, res) => {
    if (storedUser) {
      // User is logged in
        const user = storedUser;
      res.send(user);
      console.log('User is logged in');
    } else {
      // User is not logged in
      res.send({ message: 'You are not logged in' });
      console.log('User is not logged in');
    }
  });


app.get('/logout', (req, res) => {
    req.session.destroy();
    storedUser = null;
    res.send({ message: 'User logged out' });
  });

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});