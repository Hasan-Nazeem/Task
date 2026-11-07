require('dotenv').config();
const express = require('express');
const chalk = require('chalk');
const cors = require('cors');
const helmet = require('helmet');
const keys = require('./config/keys');
const routes = require('./routes');
const socket = require('./socket');
const setupDB = require('./utils/db');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false, frameguard: true }));
app.use(cors());

async function start() {
  await setupDB();
  await require('./config/passport')(app);
  app.use(routes);
  const server = app.listen(keys.port, () => {
    console.log(`${chalk.green('✓')} ${chalk.blue(`Listening on port ${keys.port}.`)}`);
  });
  socket(server);
}
start().catch(error => {
  console.error('Failed to start API server', error);
  process.exit(1);
});
