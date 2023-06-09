const knex = require('knex');

// createTcpPool initializes a TCP connection pool for a Cloud SQL
// instance of Postgres.
const createTcpPool = async config => {
    const dbConfig = {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: 'postgres',
            password: process.env.DB_PASS,
            database: 'postgres',
        },
        multipleStatements: true,
        ...config,
    };
    return knex(dbConfig);
};

module.exports = createTcpPool;