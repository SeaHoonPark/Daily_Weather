var express  = require('express');
var router   = express.Router();
var User     = require('../models/user');
var util     = require('../util');

// index
router.get('/', util.isLoggedin, function(req,res,next){
  User.find({})
  .sort({id:1})
  .exec(function(err,users){
    res.json(err||!users? util.successFalse(err): util.successTrue(users));
  });
});

// create
router.post('/', function(req,res,next){
  var newUser = new User(req.body);
  newUser.save(function(err,user){
    res.json(err||!user? util.successFalse(err): util.successTrue(user));
  });
});

// show
router.get('/:id', util.isLoggedin, function(req,res,next){
  User.findOne({id:req.params.id})
  .exec(function(err,user){
    res.json(err||!user? util.successFalse(err): util.successTrue(user));
  });
});

// update
router.put('/:id', util.isLoggedin, checkPermission, function(req,res,next){
  User.findOne({id:req.params.id})
  .select({password:1})
  .exec(function(err,user){
    if(err||!user) return res.json(util.successFalse(err));

    // update user object
    user.originalPassword = user.password;
    user.password = req.body.newPassword? req.body.newPassword: user.password;
    for(var p in req.body){
      user[p] = req.body[p];
    }

    // save updated user
    user.save(function(err,user){
      if(err||!user) return res.json(util.successFalse(err));
      else {
        user.password = undefined;
        res.json(util.successTrue(user));
      }
    });
  });
});
//losing Password

router.put('/lose/:id',function(req,res,next){
  User.findOne({id:req.params.id})
  .select({password:1})
  .exec(function(err,user){
    if(err||!user) return res.json(util.successFalse(err));
    user.password = req.body.newPassword;
    for(var p in req.body){
      user[p] = req.body[p];
    }
    user.save(function(err,user){
      if(err||!user) return res.json(util.successFalse(err));
        res.json(req.body.newPassword);
    });
  });
});





// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req,res,next){
  User.findOneAndRemove({id:req.params.id})
  .exec(function(err,user){
    res.json(err||!user? util.successFalse(err): util.successTrue(user));
  });
});

module.exports = router;
// update gu
router.put('/mypage/updateGu/:id', util.isLoggedin,function(req,res,next){
 User.update({id:req.params.id},{$set: {gu: req.body.gu}},function(err,user){
   if(err||!user) return res.json(util.successFalse(err));

   return res.json(util.successTrue(user));
});
});

/*==========================
  private function tokon id === DB의 user _id
============================*/
function checkPermission(req,res,next){
  User.findOne({id:req.params.id}, function(err,user){
    if(err||!user) return res.json(util.successFalse(err));
    else if(!req.decoded || user._id != req.decoded._id)
      return res.json(util.successFalse(null,'You don\'t have permission'));
    else next();
  });
}
