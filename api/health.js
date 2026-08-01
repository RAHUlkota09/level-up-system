// Vercel Serverless Function for Health Check
module.exports = (req, res) => {
  res.json({
    status: 'SYSTEM ONLINE',
    message: 'Level Up System Backend Active',
    timestamp: new Date().toISOString()
  });
};
