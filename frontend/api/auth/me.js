// Vercel Serverless Function for getMe
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let authControllerPath = path.join(__dirname, '../../backend/controllers/authController');
if (!fs.existsSync(authControllerPath + '.js')) {
  authControllerPath = path.join(__dirname, '../backend/controllers/authController');
}
let authMiddlewarePath = path.join(__dirname, '../../backend/middleware/auth');
if (!fs.existsSync(authMiddlewarePath + '.js')) {
  authMiddlewarePath = path.join(__dirname, '../backend/middleware/auth');
}

const { getMe } = require(authControllerPath);
const authMiddleware = require(authMiddlewarePath);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.all('*', authMiddleware, (req, res) => getMe(req, res));

module.exports = app;
