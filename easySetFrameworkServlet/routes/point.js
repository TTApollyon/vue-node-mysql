var express = require('express');
var router = express.Router();
var db = require('../mysql/mysql')
var pointSql = require('../mysql/ssPoint')

var mysql =require('mysql')
var dbConfig = require('../mysql/dbConfig')
var pool = mysql.createConnection(dbConfig.mysql)

router.post("/",function(req,res,next){
    db.query(pointSql.queryAll,function(err,rows,fields){
        if(err){
            console.log(err)
            return
        }
        res.json({data:rows,code:200})
    })
})

router.post("/add",function(req,res,next){
    var name = req.body.name;
    var x = req.body.x;
    var y = req.body.y;
    var lineslist = req.body.lineslist;
    

    var value = [name,x,y,lineslist]
    pool.query(pointSql.insert,value,function(err,result){
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
        pool.query(pointSql.delete+addSql,name,function(err,result){
            if(err){
                console.log(err)
                return;
            }
            res.json({data:result,code:200})
        })
    }
    pool.query(pointSql.delete,function(err,result){
        if(err){
            console.log(err)
            return;
        }
        res.json({data:result,code:200})
    })

})

module.exports = router;