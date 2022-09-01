require('dotenv').config();

const http = require('http');

const app = require("./index.js");

const server = http.createServer(app);
server.listen(process.env.PORT)