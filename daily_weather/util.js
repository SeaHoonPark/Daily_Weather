var jwt = require('jsonwebtoken');

var util = {};

util.successTrue = function(data){
  return {
    success:true,
    message:null,
    errors:null,
    data:data
  };
};
util.successTrue1 = function(data,gu,_id){
  return {
    success:true,
    message:null,
    errors:null,
    data:data,
    gu:gu,
    _id:_id
  };
};
util.successTrue2 = function(gu,humidity,air_volume,cold,heat,user_outer,user_top,user_bottom){
  return {
    success:true,
    message:null,
    errors:null,
    gu:gu,
    humidity:humidity,
    air_volume:air_volume,
    cold:cold,
    heat:heat,
    user_outer:user_outer,
    user_top:user_top,
    user_bottom:user_bottom
  };
};
util.successFalse = function(err, message){
  if(!err&&!message) message = 'data not found';
  return {
    success:false,
    message:message,
    errors:(err)? util.parseError(err): null,
    data:null
  };
};

util.parseError = function(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } else if(errors.code == '11000' && errors.errmsg.indexOf('id') > 0) {
    parsed.username = { message:'This username already exists!' };
  } else {
    parsed.unhandled = errors;
  }
  return parsed;
};


// middlewares
util.isLoggedin = function(req,res,next){
  var token = req.headers['x-access-token'];
  if (!token) return res.json(util.successFalse(null,'token is required!'));
  else {
    jwt.verify(token, 'qkrwltn', function(err, decoded) {
      if(err) return res.json(util.successFalse(err));
      else{
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = util;
