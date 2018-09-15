var Board = require('../models/board');
var express = require('express');
var router = express.Router();
var util     = require('../util');
var User     = require('../models/user');
var mongoose=require('mongoose');


//구재설정
router.put('/updateGu/:id', util.isLoggedin,function(req,res,next){
 User.update({id:req.params.id},{$set: {gu: req.body.gu}},function(err,user){
   if(err||!user) return res.json(util.successFalse(err));

   return res.json(util.successTrue(user));
});
});

//자기가 쓴 글 보여주기
router.get('/:user_id', util.isLoggedin, function(req,res,next){
Board.find({user_id:req.params.user_id})
.exec(function(err,user){
 res.json(err||!user? util.successFalse(err): util.successTrue(user));
});
});
module.exports = router;
