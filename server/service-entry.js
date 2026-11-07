require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const setupDB = require('./utils/db');

// Register every model in each service process. Mongoose populate() needs the
// referenced schemas registered even when the model is owned by another service.
[
  'address', 'brand', 'cart', 'category', 'contact', 'merchant',
  'order', 'product', 'review', 'user', 'wishlist'
].forEach(model => require(`./models/${model}`));

const serviceRoutes = {
  user: {
    auth: require('./routes/api/auth'),
    user: require('./routes/api/user'),
    address: require('./routes/api/address'),
    newsletter: require('./routes/api/newsletter'),
    contact: require('./routes/api/contact'),
    merchant: require('./routes/api/merchant')
  },
  product: {
    product: require('./routes/api/product'),
    category: require('./routes/api/category'),
    brand: require('./routes/api/brand'),
    review: require('./routes/api/review'),
    wishlist: require('./routes/api/wishlist')
  },
  order: {
    cart: require('./routes/api/cart'),
    order: require('./routes/api/order')
  }
};

const serviceName = process.env.SERVICE_NAME;
if (!Object.prototype.hasOwnProperty.call(serviceRoutes, serviceName)) {
  throw new Error(
    `SERVICE_NAME must be one of: ${Object.keys(serviceRoutes).join(', ')}`
  );
}

const app = express();
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '2mb' }));
app.use(helmet({ contentSecurityPolicy: false, frameguard: true }));
app.use(cors());

let requestCount = 0;
let serverErrorCount = 0;
app.use((req, res, next) => {
  if (req.path !== '/metrics') requestCount += 1;
  res.on('finish', () => {
    if (res.statusCode >= 500) serverErrorCount += 1;
  });
  next();
});

app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'not_ready',
    service: serviceName,
    database: databaseReady ? 'connected' : 'disconnected'
  });
});

// Lightweight Prometheus-format process metrics. Host metrics are collected
// separately by Node Exporter in the monitoring stack.
app.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8').send([
    '# HELP app_http_requests_total HTTP requests received by this service.',
    '# TYPE app_http_requests_total counter',
    `app_http_requests_total{service="${serviceName}"} ${requestCount}`,
    '# HELP app_http_server_errors_total HTTP 5xx responses from this service.',
    '# TYPE app_http_server_errors_total counter',
    `app_http_server_errors_total{service="${serviceName}"} ${serverErrorCount}`,
    '# HELP app_process_uptime_seconds Process uptime in seconds.',
    '# TYPE app_process_uptime_seconds gauge',
    `app_process_uptime_seconds{service="${serviceName}"} ${uptime}`,
    '# HELP app_process_resident_memory_bytes Resident memory in bytes.',
    '# TYPE app_process_resident_memory_bytes gauge',
    `app_process_resident_memory_bytes{service="${serviceName}"} ${memory.rss}`,
    '# HELP app_process_heap_used_bytes Heap memory used in bytes.',
    '# TYPE app_process_heap_used_bytes gauge',
    `app_process_heap_used_bytes{service="${serviceName}"} ${memory.heapUsed}`,
    ''
  ].join('\n'));
});

const apiRouter = express.Router();
Object.entries(serviceRoutes[serviceName]).forEach(([route, router]) => {
  apiRouter.use(`/${route}`, router);
});
apiRouter.use((req, res) => res.status(404).json({ message: 'No API route found' }));

const apiPrefix = `/${keys.app.apiURL || 'api'}`;
app.use(apiPrefix, apiRouter);
app.get('/', (req, res) => res.status(200).json({ service: serviceName, status: 'running' }));

async function start() {
  await setupDB();
  await require('./config/passport')(app);

  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`${serviceName} service listening on port ${port}`);
  });

  if (serviceName === 'user') {
    require('./socket')(server);
  }

  const shutdown = () => {
    server.close(() => {
      mongoose.connection.close(false).finally(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch(error => {
  console.error(`Failed to start ${serviceName} service`, error);
  process.exit(1);
});
