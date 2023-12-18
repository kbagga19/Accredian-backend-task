const express = require("express");
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(bodyParser.json());
app.use(cors({credential: true, origin: 'http://localhost:3000'}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Baggaji19@',
    database: 'users',
});
connection.connect();

const salt = bcrypt.genSaltSync(10);
const secret = 'hjbsd7iueiuca8';


app.post('/signup', (req, res) => {
    const data = req.body;
    data.password = bcrypt.hashSync(data.password, salt);

    connection.query('INSERT INTO users SET ?', data, (error, results) => {
        if (error) {
            res.status(400).json(error.sqlMessage)
        }
        else {
        res.send({ message: 'User added successfully!'})}
    })
});


app.post('/login', (req, res) => {
    const data = req.body;
    const email = data.email;
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error('Wrong credentails:', err);
            return;
        }
        
        if (results.length > 0) {
            const user = results[0];
            console.log(user)
            const passOk = bcrypt.compareSync(data.password, user.password);
            if (passOk) {
                const token = jwt.sign({email, id:user.id}, secret, (err, token) => {
                  if (err) throw err;
                  res.json({status: "ok", data: token});
                })
              } else {
                res.status(400).json("Wrong Credentials!");
              }
        } else {
            res.status(400).json("Wrong details!")
        }
    })
})

app.listen(3001, () => {console.log("Node server is running on 3001")})