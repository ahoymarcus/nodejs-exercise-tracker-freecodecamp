const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();


mongoose.connect(process.env.MONGODB_SRV || 'mongodb://127.0.0.1:27017/exercise_tracker', { useNewUrlParser: true }, { useUnifiedTopology: true });


const personSchema = new mongoose.Schema({
	username: {type: String, unique: true} }
);
const Person = mongoose.model('Person', personSchema); 

const exerciseSchema = new mongoose.Schema({
	userId: String, 
	description: String, 
	duration: Number, 
	date: Date
});
const Exercise = mongoose.model("Exercise", exerciseSchema);


app.use(cors());

// Configure Body-Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get("/api/users", (req, res) => {
  Person.find({}, (err, data) => {
    if(!data){
      res.send("No users");
    }else{
			res.json(data);
    }
  });
  
});

app.post("/api/users", (req, res) => {

  const newPerson= new Person({username: req.body.username});
  newPerson.save((err, data) => {
    if(err){
      res.json("Username already taken");
    }else{
			res.json({"username": data.username, "_id": data.id });
    }
  });
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
      res.send("Unknown userId");
    }else{
      const username = data.username;
			let newExercise = new Exercise({
				userId, 
				description, 
				duration, 
				date 
			});
			newExercise.save((err, data) => {
				res.json({
					username,
					_id: data.userId,
					description, 
					duration: +duration,   
					date: new Date(date).toDateString()
				});
			});
		}
  });
});

app.get("/api/users/:_id/logs", (req, res)=>{
  console.log('req.body.....', req.body);
	console.log('req.params...', req.params);
	console.log('req.query....', req.query);
	
	const { from, to, limit } = req.query;
	
  const id = req.params;
	console.log('id....', id);
	
	Person.findById(id, (err, data) => {
    		
		if(!data){
      res.send("Unknown user Id");
    }else{
      const username = data.username;
			const userId = data.id;
			console.log('Database username: ', username);
			console.log('Database user userId: ', userId);
			
			console.log({"from": from, "to": to, "limit": limit});
      
			Exercise.find({userId}).select(["id","description", "duration", "date"]).exec( (err, data) => {
        let customdata = data.map(exer => {
          let dateFormatted = new Date(exer.date).toDateString();
          
					return { 
						description: exer.description,
						duration: exer.duration, 
						date: dateFormatted
					};
        })
				
				
				console.log('customdata.....', customdata);
				
				///*DATE FILTERS*/
					if (from || to) {
						// /*Maximum range dates*/
						let fromDate = new Date(0); // lowest date
						let toDate = new Date(); // current date
						
						if (from) {
							fromDate = new Date(from);
						}
						if (to) {
							toDate = new Date(to);
						}
						
						fromDate = fromDate.getTime();
						toDate = toDate.getTime();
						console.log('fromDate: ' + fromDate + ' toDate: ' + toDate);
						
						customdata = customdata.filter((exercise) => {
							let exerciseDate = new Date(exercise.date).getTime();
							
							return exerciseDate >= fromDate && exerciseDate <= toDate;
						});
					}
					
					// /*LIMIT FILTERS*/
					if (limit) {
						customdata = customdata.slice(0, limit);
					}
				
				
        if(!data){
          res.json({
            "userId": userId,
            "username": username,
            "count": 0,
            "log": []});
        }else{
          res.json({
            "userId": userId,
            "username": username,
            "count": data.length,
            "log": customdata});
        }
      });
    }
  });
});




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


