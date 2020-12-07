//module.exports=function(){

const express=require('express');
const bodyParser=require('body-parser');
const nodemailer=require('nodemailer');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
app=express();
app.use(express.json());

const db=require('./shiabudget-db.js');
db.con(mongoose);
user=db.user;
txn=db.txn;

const appMail="shiabudget@gmail.com";


app.post('/shiabudget/emailverify',(req,res)=>{
	const email=req.body.email;
	console.log(email,appMail);
	var pat=email.substring(email.lastIndexOf('.'));
	console.log(pat);
    if(pat!='.com' && pat!='.co.in' && pat!='.in'){ res.send({status:0,msg:"Email Id not correct"}); }
	else{
		user.findOne({email:email},(err,user1)=>{
	    if(err)res.send({status:0,msg:"Something went wrong"});
		else if(user1)res.send({status:0,msg:"Email Already Registered"});
		else{
				const otp=Math.floor(Math.random()*(9999-1000)+1000);
				var transporter = nodemailer.createTransport({service:'Gmail',auth: {user:appMail,pass:'YAali@786'}});
				const mailOptions = {from: appMail, to: email, subject: 'Shia Budget Email Verification OTP', text:'Your otp is '+otp};
				transporter.sendMail(mailOptions, function (err, info) { if(err){res.send({status:0,msg:"Email Id not correct"}); console.log(err);}else {  console.log(info);  res.send({status:1,otp:otp}); }}); 
																						
	     	}	
	   });	
	}
});

app.post('/shiabudget/emailverifyforgotpassword',(req,res)=>{
	const email=req.body.email;
	var pat=email.substring(email.lastIndexOf('.'));
	console.log(pat);
    if(pat!='.com' && pat!='.co.in' && pat!='.in'){ res.send({status:0,msg:"Email Id not correct"}); }
	else{
		user.findOne({email:email},(err,user1)=>{
	    if(err)res.send({status:0,msg:"Something went wrong"});
		else if(!user1)res.send({status:0,msg:"Email not registered"});
		else{
				const otp=Math.floor(Math.random()*(9999-1000)+1000);
				var transporter = nodemailer.createTransport({service:'Gmail',auth: {user:appMail,pass:'YAali@786'}});
							const mailOptions = {from: appMail, to: email, subject: 'Shia Budget Email Verification OTP', text:'Your otp is '+otp};
							transporter.sendMail(mailOptions, function (err, info) { if(err) console.log(err);else {  console.log(info);  res.send({otp1:otp,status:1}); } 
																				});
	     	}	
	  });	
	}
});


app.post('/shiabudget/updatepassword',(req,res)=>{
	email=req.body.email;
	pass=req.body.pass;

	user.findOne({email:email},(err,user1)=>{
	    if(err)console.log(err); 
	    else if(!user1){ console.log('Already A User');console.log(user1); res.send({name:"Email not registered",status:0}); }
		else{
			    bcrypt.hash(pass,12,(err,hash)=>{
					
						user.updateOne({email:email},{pass:hash},(err,user2)=>{ if(err){console.log(err); res.send({name:"Someting Went Wrong",status:0}); } 
						                            else {console.log(user2); res.send({name:"Password successfully updated",status:1}); }  
						});
				});
				
			}
	});	
	
});


app.post('/shiabudget/register',(req,res)=>{
	console.log(req.body);
	const email=req.body.email;
	const name=req.body.name;
	const pass=req.body.pass;
	const balance=req.body.balance;
	const pure=req.body.pure;
	const date=req.body.date;
	const month=req.body.month;
	const year=req.body.year;
	const timestamp=req.body.timestamp;
	
	console.log("User registered: "+name);
	// store to database
	
	user.findOne({email:req.body.email},(err,user1)=>{
	    if(err)console.log(err); 
	    else if(user1){ console.log('Already A User');console.log(user1); res.send({name:"Already Registered",status:0}); }
		else{
			    bcrypt.hash(pass,12,(err,hash)=>{
						var Newuser=new user({name:name,email:email,pass:hash,balance:balance,pure:pure,mili:"0",alarmDate:"",alarmTime:"",
						txn:[{topic:"Balance when registered",amount:balance,status:1,balance:balance,pure:pure,timestamp:timestamp,date:date,month:month,year:year}]});			
						Newuser.save((err,user2)=>{ if(err){console.log(err); res.send({name:"Someting Went Wrong",status:0}); } 
						                            else {console.log(user2); res.send({name:"Successfully Registered",status:1}); }  
						});
				});
				
			}
	});
  });
  

app.post('/shiabudget/login',(req,res,next)=>{
	console.log(req.body);
	email=req.body.email;
	pass=req.body.pass;

	 user.findOne({email:email})
    .then(function(user1) {
		if(user1){ return bcrypt.compare(pass,user1.pass); }
    })
    .then(function(samePassword) {
         console.log(samePassword);
		 if(samePassword==true){
				user.findOne({email:email},(err,user2)=>{
					console.log(user2);
				
					res.send({name:user2.name,mili:user2.mili,alarmDate:user2.alarmDate,alarmTime:user2.alarmTime,status:1});  }); 
		 }
		 else res.send({name:"Wrong Credentials",status:0});
     })
    .catch(function(error){
        console.log("Error authenticating user: ");
		res.send({name:"Something Went Wrong",status:0});
        console.log(error);
        next();
    }); 
}  );


app.post('/shiabudget/home',(req,res)=>{
	console.log(req.body);
	email=req.body.email;
	date=req.body.date;
	month=req.body.month;
	year=req.body.year;
	credit=0; debit=0;
	var result={};
	user.findOne({email:email},(err,user1)=>{
		result.balance=user1.balance;
			user1.txn.map((t)=>{if(t.status==1 && t.date==date && t.month==month && t.year==year)credit+=t.amount});
			user1.txn.map((t)=>{if(t.status==-1 && t.date==date && t.month==month && t.year==year)debit+=t.amount});
				result.credit=credit;
				result.debit=debit;
			
				console.log(result);
				res.send(result);
	})
	
})
  
  
  app.post('/shiabudget/createTxn',(req,res)=>{
	console.log(req.body);
	
	topic=req.body.topic;
	email=req.body.email;
	date=req.body.date;
	month=req.body.month;
	year=req.body.year;
	timestamp=req.body.timestamp;
	status=req.body.status;
	amount=req.body.amount;
	pure=req.body.pure;
	pure1=req.body.pure1;

	user.findOne({email:email},(err,user1)=>{
			const balance=user1.balance+status*amount;
			if(pure)pure=user1.pure-amount;
			else if(pure1)pure=user1.pure+amount;
			else pure=user1.pure;
			
				if(balance<0 || pure<0)res.send({status:0,msg:"Balance can't be negative"});
				else if(balance<pure)res.send({status:0,msg:"Pure balance can't be greater"});
				else 
				{
					var txn={topic:topic,amount:amount,status:status,balance:balance,pure:pure,timestamp:timestamp,date:date,month:month,year:year};
					user.updateOne({email:email},{ balance:balance,pure:pure,$push: {txn:txn}},(err,user1)=>{ console.log(user1);res.send({msg:"Balance successfully updated",status:1}); })
				}
			
	})
})

app.post('/shiabudget/creditAll',(req,res)=>{
	user.findOne({email:req.body[0].email},(err,user1)=>{if(err){} else res.send(user1.txn.filter(t=>t.status==1).reverse());});
})
  
  
app.post('/shiabudget/debitAll',(req,res)=>{
	user.findOne({email:req.body[0].email},(err,user1)=>{if(err){} else res.send(user1.txn.filter(t=>t.status==-1).reverse());});
})
  
  
app.post('/shiabudget/impure',(req,res)=>{
	user.findOne({email:req.body.email},(err,user1)=>{if(err){} else res.send({pure:user1.pure,impure:user1.balance-user1.pure});});
})
  
  
  
  
app.post('/shiabudget/paykhums',(req,res)=>{
	email=req.body.email;
	khums=req.body.khums;
	topic="Paid Khums";
	status=-1;
	timestamp=req.body.timestamp;
	date=req.body.date;
	month=req.body.month;
	year=req.body.year;
	user.findOne({email:email},(err,user1)=>{
		balance=user1.balance-khums;
		amount=khums;
			console.log(khums,user1.balance,user1.pure);

		if(khums>user1.balance-user1.pure)
							res.send({status:0,msg:"Amount exceeds the impure balance"});
		else{
			if(err){} 
			else {
					var txn={topic:topic,amount:amount,status:status,balance:balance,pure:balance,timestamp:timestamp,date:date,month:month,year:year};

					user.updateOne({email:email},{pure:balance,balance:balance,$push: {txn:txn}},(err,user2)=>{
						if(err)res.send({status:0,msg:"Something Went Wrong"});
						else res.send({status:1,msg:"Balance successfully updated",pure:balance,balance,impure:0});
					});
			  }
		}
	});
})  



app.post('/shiabudget/storereminder',(req,res)=>{
	email=req.body.email;
	mili=req.body.mili;
	alarmDate=req.body.alarmDate;
	alarmTime=req.body.alarmTime;
	
	
	user.updateOne({email:email},{mili:mili,alarmDate:alarmDate,alarmTime:alarmTime},(err,user1)=>{
	    if(err)console.log(err); 
	     res.send({name:"Done"});
	});	
	
});





  
app.post('/shiabudget/delete',(req,res)=>{
	user.deleteOne({email:req.body.email},(err,user1)=>{if(err)res.send({status:0,msg:"Something went wrong"}); else res.send({status:1,msg:"Account deleted successfully"});});
})
  
  
  
  
app.post('/shiabudget/deleteTxn',(req,res)=>{
	
	const id=req.body.id;	
	const email=req.body.email;	
	const status=req.body.status;
	user.findOne({email:email},(err,user1)=>{
	if(err){console.log(err); res.send({status:0,msg:"Something went wrong"});}
	else{   
		var txn=user1.txn;
		
		const obj=txn.find((t)=>t._id==id);
		const ind=txn.indexOf(obj);
			console.log(id);

		console.log(obj,ind);
		var newTxn=[];
		txn.map((t,index)=>{if(index<ind)newTxn.push(t);  });
		
		if(newTxn.length==0){
			balance=pure=0;
		}
		else{
			balance=newTxn[newTxn.length-1].balance;
			pure=newTxn[newTxn.length-1].pure;
		}
		user.updateOne({email:email},{balance,pure,txn:newTxn},(err,user1)=>{
				if(err)res.send({status:0,msg:"Something went wrong"});
				 res.send({status:1,msg:"Successfully Deleted",txn:newTxn.filter(t=>t.status==status)});
			});	
	
		}
	
	});	
	
})  
  


app.listen(8080,()=>{console.log("Server on 8080")});
//}