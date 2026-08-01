// Vercel Serverless Function for Register
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let authControllerPath = path.join(__dirname, '../../backend/controllers/authController');
if (!fs.existsSync(authControllerPath + '.js')) {
  authControllerPath = path.join(__dirname, '../backend/controllers/authController');
}

const { register } = require(authControllerPath);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.all('*', (req, res) => register(req, res));

module.exports = app;
