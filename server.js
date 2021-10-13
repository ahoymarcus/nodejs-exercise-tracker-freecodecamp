const express = require('express')
const app = express()
const bodyParser = require('body-parser')
require('dotenv').config();

const cors = require('cors')

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_SRV || 'mongodb://127.0.0.1:27017/exercise_tracker', { useNewUrlParser: true }, { useUnifiedTopology: true });


const personSchema = new mongoose.Schema({ username: {type: String, unique: true} });
const Person = mongoose.model('Person', personSchema); 

const exerciseSchema = new mongoose.Schema({userId: String, description: String, duration: Number, date: Date})
const Exercise = mongoose.model("Exercise", exerciseSchema)
app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {

  const newPerson= new Person({username: req.body.username});
  newPerson.save((err, data) => {
    if(err){
      res.json("Username already taken")
    }else{

    res.json({"username": data.username, "_id": data.id })
    }
  })
});

app.post("/api/users/:_id/exercises", (req,res) => {
	console.log('req.body.....', req.body);
	console.log('req.params.....', req.params);
  let { description, duration, date } = req.body;
	let userId = req.params;
	console.log('userId', userId);
	
	
  if(!date){
    date = new Date();
  }

  Person.findById(userId, (err, data) => {
    if(!data){
      res.send("Unknown userId")
    }else{
      const username = data.username;
			let newExercise = new Exercise({
				userId, 
				description, 
				duration, 
				date 
			})
			newExercise.save((err, data) => {
				res.json({
					username,
					_id: data.userId,
					description, 
					duration: +duration,   
					date: new Date(date).toDateString()
				})
			})
		}
  //   username: 'fcc_test_1596648410971', // Obviously the numbers change
  // description: 'test',
  // duration: 60,
  // _id: 5f29cd9e782d5f13d127b456, // Example id
  // date: 'Mon Jan 01 1990'

  })
})

app.get("/api/users/:_id/logs", (req, res)=>{
  const {userId, from, to, limit} = req.query;
  Person.findById(userId, (err, data) => {
    if(!data){
      res.send("Unknown userId")
    }else{
      const username = data.username;
      console.log({"from": from, "to": to, "limit": limit});
      Exercise.find({userId},{date: {$gte: new Date(from), $lte: new Date(to)}}).select(["id","description", "duration", "date"]).limit(+limit).exec( (err, data) => {
        let customdata = data.map(exer => {
          let dateFormatted = new Date(exer.date).toDateString();
          return {id: exer.id, description: exer.description, duration: exer.duration, date: dateFormatted}
        })
        if(!data){
          res.json({
            "userId": userId,
            "username": username,
            "count": 0,
            "log": []})
        }else{
          res.json({
            "userId": userId,
            "username": username,
            "count": data.length,
            "log": customdata})
        }
      })
      
    }
  })
})

app.get("/api/users", (req, res) => {
  Person.find({}, (err, data) => {
    if(!data){
      res.send("No users")
    }else{

    res.json(data)
    }
  })
  
})
// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


