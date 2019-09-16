var express = require('express');
var router = express.Router();

var db = require('../mysql/mysql')
var testSQL = require('../mysql/dbtest')


router.get('/',function(req,res,next){
    res.json({data:{name:'ccc',pwd:'123'},code:200});
})

router.post('/',function(req,res,next){
    console.log(req.body.dsw)
    db.query(testSQL.queryAll,function(err,rows,fields){
        if(err){
            console.log(err);
            return;
        }
        res.json({data:rows,code:200});
    })
})

router.post('/insert',function(req,res,next){
    var sql = "insert into ss(1,2,3,4) VALUES(?,?,?,?)";
    var values = ['1','2','3','4'];
    db.query(sql,values,function(err,rows,fields){
        if(err){
            console.log(err);
            return;
        }
        res.json({data:rows,code:200});
    })
})

module.exports = router;