const { MongoClient } = require('mongodb')

const dbName = 'ready-salted';
let dbConnection;

module.exports = {
    connectToDb: (callback) => {
        MongoClient.connect(`mongodb://localhost:27017/${dbName}`)
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