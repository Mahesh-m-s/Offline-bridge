if (process.env.NODE_ENV !== 'development') {
  console.error('db:reset is restricted to NODE_ENV=development. Set it explicitly to continue.');
  process.exit(1);
}
const { pool } = require('../db/pool');
pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
  .then(() => require('./migrate').migrate())
  .then(() => require('./seed').seed())
  .then(() => console.log('Development database reset complete.'))
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => pool.end());
