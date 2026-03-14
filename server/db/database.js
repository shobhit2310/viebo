// In-memory database for demo purposes
// In production, use MongoDB, PostgreSQL, etc.

const db = {
  users: [],
  events: [],
  crushes: [],
  matches: [],
  messages: []
};

module.exports = db;
