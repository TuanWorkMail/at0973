//TODO before release check connection pooling and auto reconnect
var mysql = require('mysql'),
    connection = mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '',
        database: 'tank5'
    });
exports.runQuery = function(query, array, callback){
    connection.query(query, array, callback);
}