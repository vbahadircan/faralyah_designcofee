// Runs once, on the first start of an empty data volume.
// Creates a least-privilege user for the app; the root user is only for admin/backup work.
const appDb = db.getSiblingDB('faralyah');
appDb.createUser({
  user: process.env.APP_DB_USER,
  pwd: process.env.APP_DB_PASSWORD,
  roles: [{ role: 'readWrite', db: 'faralyah' }],
});
