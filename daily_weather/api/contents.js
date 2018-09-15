var Board = require('../models/board');
var express = require('express');
var router = express.Router();
var util     = require('../util');
var User     = require('../models/user');
var mongoose=require('mongoose');
var imageCtrl = require('./imageupload');
var parseint=require('parse-int');

//신고하기  &&신고횟수5이상 삭제!
router.put('/:_id/notify_count',util.isLoggedin,function(req,res){
  Board.findOneAndUpdate({_id:req.params._id},{$inc:{"notify_count":1}},{new:true},function(err,boards){
    if(boards.notify_count>=5){
      Board.findOneAndRemove({_id:boards._id},boards,function(err,board){
        return res.json(util.successTrue());
    });
    }
    else if(boards.notify_count)return res.json(util.successTrue(boards));
    else if(err)return res.json(util.successFalse());
  });
});

// 최근 (3시간 간격) 게시물 보기
router.get('/main',function(req,res){
  var selectGu=req.query.gu;
  Board.find({
    created_at : {
       $gte: new Date(Date.now()-3*60*60*1000),
       $lt: new Date(Date.now())
    }})
  .find({gu:selectGu})
  .sort({created_at:-1})
  .exec(function(err,boards){
    res.json(err||!boards? util.successFalse(err):util.successTrue(boards));
  });
  });


//게시물 작성하기 &&월별 날씨 미리 설정해주기.
router.post('/',util.isLoggedin,imageCtrl.uploadSingle,function(req,res,next){

var newBoard = new Board();
var now = new Date();
  if(req.file){
newBoard.gu=req.body.gu;
newBoard.content=req.body.content;
newBoard.user_id=req.body.user_id;
newBoard.humidity=  parseint(req.body.humidity);
newBoard.air_volume  = parseint(req.body.air_volume);
newBoard.user_outer  =  parseint(req.body.user_outer);
newBoard.user_top =   parseint(req.body.user_top);
newBoard.user_bottom = parseint(req.body.user_bottom);
newBoard.image = req.file.location;
if(2<now.getMonth()+1 < 10){
   newBoard.cold = "0";
   newBoard.heat = parseint(req.body.heat);
 }else{
   newBoard.cold = parseint(req.body.cold);
   newBoard.heat = "0";
 }
  newBoard.save(function(err,board){

    res.json(err||!board? util.successFalse(err):util.successTrue(board));
  });
}
else{
  newBoard.gu=req.body.gu;
  newBoard.content=req.body.content;
  newBoard.user_id=req.body.user_id;
  newBoard.humidity=  parseint(req.body.humidity);
  newBoard.air_volume  = parseint(req.body.air_volume);
  newBoard.user_outer  =  parseint(req.body.user_outer);
  newBoard.user_top =   parseint(req.body.user_top);
  newBoard.user_bottom = parseint(req.body.user_bottom);
  if(now.getMonth()+1 < 9){
     newBoard.cold = "0";
     newBoard.heat = parseint(req.body.heat);
   }else{
     newBoard.cold = parseint(req.body.cold);
     newBoard.heat = "0";
   }
  newBoard.save(function(err,board){

    res.json(err||!board? util.successFalse(err):util.successTrue(board));
});
}
});

module.exports = router;



//게시물수정하기
router.put('/:_id', util.isLoggedin,imageCtrl.uploadSingle,function(req,res){
  req.body.updated_at =Date.now();

  var newBoard= {};
  if(req.file){
newBoard.gu=req.body.gu;
newBoard.content=req.body.content;
newBoard.user_id=req.body.user_id;
newBoard.humidity=  parseint(req.body.humidity);
newBoard.air_volume  = parseint(req.body.air_volume);
newBoard.heat=  parseint(req.body.heat);
newBoard.cold  = parseint(req.body.cold);
newBoard.user_outer  =  parseint(req.body.user_outer);
newBoard.user_top =   parseint(req.body.user_top);
newBoard.user_bottom = parseint(req.body.user_bottom);
newBoard.image = req.file.location;
}
else{
  newBoard.gu=req.body.gu;
  newBoard.content=req.body.content;
  newBoard.user_id=req.body.user_id;
  newBoard.humidity=  parseint(req.body.humidity);
  newBoard.air_volume  = parseint(req.body.air_volume);
  newBoard.heat=  parseint(req.body.heat);
  newBoard.cold  = parseint(req.body.cold);
  newBoard.user_outer  =  parseint(req.body.user_outer);
  newBoard.user_top =   parseint(req.body.user_top);
  newBoard.user_bottom = parseint(req.body.user_bottom);
}
Board.findOneAndUpdate({_id:req.params._id},newBoard,{new:true},function(err,board){
    if(err||!board) return res.json(util.successFalse(err));
    console.log(board);
    return res.json(util.successTrue(board));
});
});

//게시글 삭제하기
router.delete('/:_id', util.isLoggedin,function(req,res,next){
  Board.findOneAndRemove({_id:req.params._id},req.body,function(err,board){
    if(err||!board) return res.json(util.successFalse(err));
    return res.json(util.successTrue(board));
});
});


//구마다 제일많은 선택지를 제공
router.get('/avg',function(req,res,next){

var selectGu=req.query.gu;

Board.aggregate([
          {
            $match:{
              gu:selectGu,
             created_at : {
               $gte: new Date(Date.now()-3*60*60*1000),
               $lt: new Date(Date.now())
            }
            },
          },
            {
            $group: {
                _id: selectGu,
                avg_humidity:{$push:'$humidity'},
                avg_air_volume:{$push:'$air_volume'},
                avg_heat:{$push:'$heat'},
                avg_cold:{$push:'$cold'},
                avg_user_outer:{$push:'$user_outer'},
                avg_user_top:{$push:'$user_top'},
                avg_user_bottom:{$push:'$user_bottom'}

              }
            }
        ],
        function (err, result) {
              if (err) {
            next(err);
        }
          if(result){
            var max_air_volume=[0,0,0,0,0];
            var max_humidity=[0,0,0,0,0];
            var max_cold=[0,0,0,0,0,0];
            var max_heat=[0,0,0,0,0,0];
            var max_user_outer=[0,0,0,0,0,0,0];
            var max_user_top=[0,0,0,0,0,0];
            var max_user_bottom=[0,0,0,0,0,0];
            var max_h=null;
            var max_a=null;
            var max_c=null;
            var max_he=null;
            var max_o=null;
            var max_t=null;
            var max_b=null;
            for(var i =0;i<result[0].avg_humidity.length;i++)
            {
              if(result[0].avg_humidity[i]===1){
                max_humidity[1]++;
              }
              else if(result[0].avg_humidity[i]===2){
                max_humidity[2]++;
              }
              else if(result[0].avg_humidity[i]===3){
                max_humidity[3]++;
              }
            }
            for( var l =0;l<result[0].avg_air_volume.length;l++)
            {
              if(result[0].avg_air_volume[l]===1){
                max_air_volume[1]++;
              }
              else if(result[0].avg_air_volume[l]===2){
                max_air_volume[2]++;
              }
              else if(result[0].avg_air_volume[l]===3){
                max_air_volume[3]++;
              }
            }
            for( var b =0;b<result[0].avg_cold.length;b++)
            {
              if(result[0].avg_cold[b]===1){
                max_cold[1]++;
              }
              else if(result[0].avg_cold[b]===2){
                max_cold[2]++;
              }
              else if(result[0].avg_cold[b]===3){
                max_cold[3]++;
              }
              else if(result[0].avg_cold[b]===0){
                max_cold[0]++;
              }
            }

            for( var he =0;he<result[0].avg_heat.length;he++)
            {
              if(result[0].avg_heat[he]===1){
                max_heat[1]++;
              }
              else if(result[0].avg_heat[he]===2){
                max_heat[2]++;
              }
              else if(result[0].avg_heat[he]===3){
                max_heat[3]++;
              }
              else if(result[0].avg_heat[he]===0){
                max_heat[0]++;
              }
            }

            for( var ou =0;ou<result[0].avg_user_outer.length;ou++)
            {
              if(result[0].avg_user_outer[ou]===1){
                max_user_outer[1]++;
              }
              else if(result[0].avg_user_outer[ou]===2){
                max_user_outer[2]++;
              }
              else if(result[0].avg_user_outer[ou]===3){
                max_user_outer[3]++;
              }
              else if(result[0].avg_user_outer[ou]===4){
                max_user_outer[4]++;
              }
              else if(result[0].avg_user_outer[ou]===5){
                max_user_outer[5]++;
              }
            }

            for( var to =0;to<result[0].avg_user_top.length;to++)
            {
              if(result[0].avg_user_top[to]===1){
                max_user_top[1]++;
              }
              else if(result[0].avg_user_top[to]===2){
                max_user_top[2]++;
              }
              else if(result[0].avg_user_top[to]===3){
                max_user_top[3]++;
              }
              else if(result[0].avg_user_top[to]===4){
                max_user_top[4]++;
              }
            }


            for( var bo =0; bo<result[0].avg_user_bottom.length;bo++)
            {
              if(result[0].avg_user_bottom[bo]===1){
                max_user_bottom[1]++;
              }
              else if(result[0].avg_user_bottom[bo]===2){
                max_user_bottom[2]++;
              }
              else if(result[0].avg_user_bottom[bo]===3){
                max_user_bottom[3]++;
              }
              else if(result[0].avg_user_bottom[bo]===4){
                max_user_bottom[4]++;
              }
            }



            for( var m =1;m<5;m++){
              if(max_humidity[m]>max_humidity[m+1]){
                max_h=max_humidity[m];
                break;
              }
              else if(max_humidity[m]===0){
                continue;
              }
              else{
                continue;
              }
            }

            for(var n=1;n<5;n++){
              if(max_h===max_humidity[n]){
              max_h=n;
              break;
            }
            }

            for( var k =1;k<5;k++){
              if(max_air_volume[k]>max_air_volume[k+1]){
                max_a=max_air_volume[k];
                break;
              }
              else if(max_air_volume[m]===0){
                continue;
              }
              else{
                continue;
              }

            }
            for(var u=1;u<5;u++){
              if(max_a===max_air_volume[u]){
              max_a=u;
              break;
            }
            }

            for( var co =0;co<5;co++){
              if(max_cold[co]>max_cold[co+1]){
                max_c=max_cold[co];
                break;
              }
              else{
                continue;
              }

            }

            for(var co1=0; co1<5 ;co1++){
              if(max_c===max_cold[co1]){
              max_c=co1;
              break;
            }
            }

            for( var he1 =0;he1<5;he1++){
              if(max_heat[he1]>max_heat[he1+1]){
                max_he=max_heat[he1];
                break;
              }

              else{
                continue;
              }

            }
            for(var he2=0; he2<5 ;he2++){
              if(max_he===max_heat[he2]){
              max_he=he2;
              break;
            }
            }

            for( var ou2 =1;ou2<7;ou2++){
              if(max_user_outer[ou2]>max_user_outer[ou2+1]){
                max_o=max_user_outer[ou2];
                break;
              }
              else if(max_user_outer[m]===0){
                continue;
              }
              else{
                continue;
              }

            }
            for(var ou3=1; ou3<7 ;ou3++){
              if(max_o===max_user_outer[ou3]){
              max_o=ou3;
              break;
            }
            }

            for( var to1 =1;to1<6;to1++){
              if(max_user_top[to1]>max_user_top[to1+1]){
                max_t=max_user_top[to1];
                break;
              }
              else if(max_user_top[m]===0){
                continue;
              }
              else{
                continue;
              }
            }
            for(var to2=1;to2<6;to2++){
              if(max_t===max_user_top[to2]){
              max_t=to2;
              break;
            }
            }
            for( var bo1 =1;bo1<6;bo1++){
              if(max_user_bottom[bo1]>max_user_bottom[bo1+1]){
                max_b=max_user_bottom[bo1];
                break;
              }
              else if(max_user_bottom[m]===0){
                continue;
              }
              else{
                continue;
              }
            }

            for(var bo2=1;bo2<6;bo2++){
              if(max_b===max_user_bottom[bo2]){
              max_b=bo2;

              break;
            }
            }

        res.json(util.successTrue2(selectGu,max_h,max_a,max_c,max_he,max_o,max_t,max_b));
      }
    });
});
