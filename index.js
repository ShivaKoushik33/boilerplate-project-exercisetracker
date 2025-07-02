const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose= require('mongoose');

// Connect to MongoDB 
mongoose.connect(process.env.MONGO_URL);
const userSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true,
    unique: true
  },
  
});
const exerciseSchema=new mongoose.Schema({
  user_id:{
    type:String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,

    required: true
  },
  date:{
    type: Date,
  required: true
  }
});
const User=mongoose.model('User', userSchema);
const Exercise=mongoose.model('Exercise', exerciseSchema);
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  console.log(req.body);
  const userObj=new User({
    username:req.body.username
  })
  try{
    const user=await userObj.save();
    console.log(user);
    res.json(user);
  }
  catch(err){
    console.log(err);
  }
});
app.get('/api/users',async(req,res)=>{
  try{
    const users=await User.find({});
    res.json(users);
  }
  catch(err){
    console.log(err);
  }
});

app.post('/api/users/:_id/exercises',async(req,res)=>{
  const id=req.params._id;
  const user=await User.findById(id);
  if(!user){
    return res.json({error: 'User not found'});
  }
  
  else{
    const data=req.body;
  const exerciseObj= new Exercise({
    user_id:id,
    description:data.description,
    duration:data.duration,
    date:data.date?new Date(data.date):new Date()
  });
  try{
    const exe=await exerciseObj.save();
    // console.log(exe);
    res.json({
      username: user.username,
      description: exe.description,
      duration: exe.duration,
      date: exe.date.toDateString(),
      _id: user._id
    });

  }
  catch(err){
    res.json({error: 'Error in saving Exercise'});
  }
  }
})




app.get('/api/users/:_id/logs',async(req,res)=>{

  console.log("Hit route");
  const {from,to,limit}= req.query; 
  const id=req.params._id;
  const user=await User.findById(id);
  if(!user){
    res.json({error: 'User not found'});
    return ;
  }
  let dateObj={};
  if(from){
    dateObj.$gte=new Date(from);
  }
  if(to){
    dateObj.$lte=new Date(to);
  }
  let filter={
    user_id:id
  }
  if(from||to){
    filter.date=dateObj;
  }

  


  const data= await Exercise.find(filter).limit(+limit ?? 500)
  const log=data.map(e=>({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }));

  res.json({
    username: user.username,
    count:data.length,
    _id: user._id,
    log
  });
 

})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
