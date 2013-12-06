//TODO before release check connection pooling and auto reconnect
var connection = require('mysql').createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'tank5'
    });
exports.runQuery = function(query, array, callback){
    connection.query(query, array, callback);
}
exports.connection = connection;