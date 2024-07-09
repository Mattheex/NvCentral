import express from 'express';
import cors from 'cors'
import SparqlClient from 'sparql-http-client'
//import dotenv from 'dotenv'
import fs from 'fs'

//fs.readFileSync('/run/secrets/app_cert_key', 'utf8')


const app = express();
const port = 5000;

//dotenv.config()

app.use(express.json())
app.use(cors())

let secretKEY;
try {
    fs.accessSync('/run/secrets/secretKEY')
    secretKEY = fs.readFileSync('/run/secrets/secretKEY','utf8')
    secretKEY = secretKEY.trim()
} catch (err) {
    console.log('use env var')
    secretKEY = process.env.secretKEY
}

/*
try {

} catch (err) {
    //

    if (err.code === 'ENOENT') {
        console.error('File not found:', 'path');
    } else {
        console.error('An error occurred while reading the file:', err.message);
    }
}*/
console.log(`NODE_ENV=${process.env.NODE_ENV}`);
console.log(`secretKEY=${secretKEY}`);


export const client =  new SparqlClient({
    endpointUrl: config.endpointUrl[process.env.NODE_ENV],
    user: config.user,
    password: secretKEY,
});


import addRoutes from './routes/add.js';
import searchRoutes from './routes/search.js';
import authRoutes from './routes/auth.js';
import getRoutes from './routes/get.js';
import config from "./constants.js";

app.use('/add', addRoutes);
app.use('/search', searchRoutes);
app.use('/auth', authRoutes);
app.use('/get', getRoutes);


app.listen(port, () => console.log('Server is running on port 5000'));
