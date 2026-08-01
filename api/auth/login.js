// Vercel Serverless Function for Login
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let authControllerPath = path.join(__dirname, '../../backend/controllers/authController');
if (!fs.existsSync(authControllerPath + '.js')) {
  authControllerPath = path.join(__dirname, '../backend/controllers/authController');
}

const { login } = require(authControllerPath);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.all('*', (req, res) => login(req, res));

module.exports = app;
