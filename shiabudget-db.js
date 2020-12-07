const mongoose=require('mongoose');
function con(mongoose){
	//mongodb://localhost/test
	// mongodb+srv://has_786:<password>@cluster0.torm7.mongodb.net/test

mongoose.connect('mongodb+srv://has_786:YAali@786@cluster0.torm7.mongodb.net/test', {useNewUrlParser: true, useUnifiedTopology: true});                
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database is connected');
});			
}
const integer={type:Number, validate : {validator : Number.isInteger}};

var txnSchema=new mongoose.Schema({topic:String,amount:Number,status:integer,balance:Number,pure:Number,timestamp:String,date:integer,month:integer,year:integer});
var txn=mongoose.model('txn',txnSchema);


var userSchema=new mongoose.Schema({name:String,email:String,pass:String,balance:{type:Number,default:0},pure:{type:Number,default:0},txn:[txnSchema],
mili:{type:String,default:"0"},alarmDate:{type:String,default:""},alarmTime:{type:String,default:""}});
var user=mongoose.model('user',userSchema);



module.exports={con:con,user:user,txn:txn};

