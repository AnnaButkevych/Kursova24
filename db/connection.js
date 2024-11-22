const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '30306',
    user: 'Anna',
    password: 'yuzuru09Q*',
    database: 'Kursova24'  
});

connection.connect(function (err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
});

function runDBCommand(sqlQuery) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

    module.exports = {
    runDBCommand,
}