require('dotenv').config();
const app = require('./app');
const connect = require('./config/db');
const PORT = process.env.PORT || 5000;
connect().then(() => app.listen(PORT, () => console.log(`API running on :${PORT}`)))
  .catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });
