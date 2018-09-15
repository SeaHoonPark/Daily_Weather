var express  = require('express');
var router   = express.Router();
var User     = require('../models/user');
var util     = require('../util');
var jwt      = require('jsonwebtoken');

// 로그인
router.post('/login',
  function(req,res,next){
    var isValid = true;
    var validationError = {
      name:'ValidationError',
      errors:{}
    };
    if(!req.body.id){
      isValid = false;
      validationError.errors.username = {message:'id  is required!'};
    }
    if(!req.body.password){
      isValid = false;
      validationError.errors.password = {message:'Password is required!'};
    }

    if(!isValid) return res.json(util.successFalse(validationError));
    else next();
  },
  function(req,res,next){
    User.findOne({id:req.body.id})
    .select({password:1,id:1,gu:1 ,_id:1})
    .exec(function(err,user){
      if(err) return res.json(util.successFalse(err));
      else if(!user||!user.authenticate(req.body.password))
         return res.json(util.successFalse(null,'id or Password is invalid'));
      else {

        var payload = {
          _id : user._id,
          id: user.id
        };
        var secretOrPrivateKey = "qkrwltn";
        var options = {expiresIn: 60*60*24};
        jwt.sign(payload, secretOrPrivateKey, options, function(err, token){
          if(err) return res.json(util.successFalse(err));
          res.json(util.successTrue1(token,user.gu,user._id));
        });
      }
    });
  }
);

// 자신의 정보확인
router.get('/me', util.isLoggedin,
  function(req,res,next) {
    User.findById(req.decoded._id)
    .exec(function(err,user){
      if(err||!user) return res.json(util.successFalse(err));
      res.json(util.successTrue(user));
    });
  }
);

// 토큰재발급
router.get('/refresh', util.isLoggedin,
  function(req,res,next) {
    User.findById(req.decoded._id)
    .exec(function(err,user){
      if(err||!user) return res.json(util.successFalse(err));
      else {
        var payload = {
          _id : user._id,
          id: user.id
        };
        var secretOrPrivateKey = '';
        var options = {expiresIn: 60*60*24};
        jwt.sign(payload, secretOrPrivateKey, options, function(err, token){
          if(err) return res.json(util.successFalse(err));
          res.json(util.successTrue(token));
        });
      }
    });
  }
);

module.exports = router;
