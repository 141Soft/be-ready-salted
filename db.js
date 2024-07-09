const { MongoClient } = require('mongodb')
const ENV = process.env.NODE_ENV || 'development'
require('dotenv').config({
    path: `${__dirname}/.env.${ENV}`
})

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set')
}

let dbConnection;
const uri = process.env.DATABASE_URL;

module.exports = {
    connectToDb: (callback) => {
        MongoClient.connect(uri)
        .then((client) => {
            dbConnection = client.db();
            return callback();
        })
        .catch((err) => {
            console.log(err);
            return callback(err);
        })
    },
    getDb: () => dbConnection
}