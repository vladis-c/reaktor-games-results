const PORT = env.process.PORT || 8000
const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express()

app.use(cors());
app.use(express.static('build'));
app.use('/', createProxyMiddleware({ target: 'https://bad-api-assignment.reaktor.com', changeOrigin: true }));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));