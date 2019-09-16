var express = require('express');
var router = express.Router();
var db = require('../mysql/mysql')
var lineSql = require('../mysql/ssLine')

var mysql =require('mysql')
var dbConfig = require('../mysql/dbConfig')
var pool = mysql.createConnection(dbConfig.mysql)

router.post("/",function(req,res,next){
    db.query(lineSql.queryAll,function(err,rows,fields){
        if(err){
            console.log(err)
            return;
        }
        res.json({data:rows,code:200})
    })
})

router.post("/add",function(req,res,next){
    var linename = req.body.linename;
    var x1 = req.body.x1;
    var y1 = req.body.y1;
    var x2 = req.body.x2;
    var y2 = req.body.y2;
    var data = [linename,x1,y1,x2,y2]
    pool.query(lineSql.insert,data,function(err,result){
        if(err){
            console.log(err)
            return
        }
        res.json({data:result,code:200})
    })
})

router.post("/del",function(req,res,next){
    var name = [req.body.name];
    var addSql = "";
    if(name!=null&&name!=""){
        addSql =  "where name = ?"
        pool.query(lineSql.delete+addSql,name,function(err,result){
            if(err){
                console.log(err)
                return;
            }
            res.json({data:result,code:200})
        })
    }
    pool.query(lineSql.delete,function(err,result){
        if(err){
            console.log(err)
            return;
        }
        res.json({data:result,code:200})
    })
})

module.exports = router;