require('dotenv').config();
const express = require('express'),
    api = require('./api'),
    bodyParser = require('body-parser'),
    morgan = require('morgan');

const BasicAuth = require('./auth/basic'),
      basicAuthInstance = new BasicAuth();

const app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Configuring API routes
app.use('/api', basicAuthInstance.basic(), api);

app.listen(process.env.PORT, () => 
    console.log(`Server listening at port ${process.env.PORT}`)
);
