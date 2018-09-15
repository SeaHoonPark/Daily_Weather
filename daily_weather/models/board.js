var mongoose = require('mongoose');
//baardSchema
var boardSchema = mongoose.Schema({
  user_id : {type:mongoose.Schema.ObjectId, ref:'users'},
  gu:{
    type:String,
    required:[true,"gu is required"],
    trim:true
  },
  air_volume:{
      type:Number,
      required:[true,"air_volume is required"]
  },
  heat:{
    type:Number,
    required:[true,"heat is required"]
},
cold:{
  type:Number,
  required:[true,"cold is required"]
},
humidity:{
  type:Number,
  required:[true,"humidity is required"]
},
user_outer:{
  type:Number
},
user_top:{
  type:Number
},
user_bottom:{
  type:Number
},
notify_count:{
  type:Number
},
content:{
  type: String,
  trim :true,
  'default':' '
},
image:{type:String},

created_at:{type:Date,index:{unique:false}, 'default':Date.now},
updated_at:{type:Date,index:{unique:false}}
});
var Board = mongoose.model('board',boardSchema);
module.exports = Board;
