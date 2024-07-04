import express from 'express';
import cors from 'cors'
import SparqlClient from 'sparql-http-client'


const app = express();
const port = 5000;

app.use(express.json())
app.use(cors())

console.log(`NODE_ENV=${process.env.NODE_ENV}`);

export const client =  new SparqlClient({
    endpointUrl: config.endpointUrl[process.env.NODE_ENV],
    user: config.user,
    password: config.secretKEY
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
