var mysql =require('mysql')
var dbConfig = require('../mysql/dbConfig')
var pool = mysql.createConnection(dbConfig.mysql)
var db = {};

db.query = function(sql, callback){
 
	if (!sql) {
		callback();
		return;
	}
	pool.query(sql, function(err, rows, fields) {
	  if (err) {
	    console.log(err);
	    callback(err, null);
	    return;
	  };
 
	  callback(null, rows, fields);
	});
}
module.exports = db;