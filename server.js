const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const app = express();

mongoose.connect(process.env.MONGODB_SRV || 'mongodb://127.0.0.1:27017/exercise_tracker', { useNewUrlParser: true }, { useUnifiedTopology: true });


// Configure SCHEMAs and MODELs for the DB
const exerciseSchema = new mongoose.Schema({
	description: { type: String, required: true },
	duration: { type: Number, required: true },
	date: Date,
	userId: String 
});
const userSchema = new mongoose.Schema({ 
	username: { type:String, required: true },
	log: [exerciseSchema]
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);



app.use(cors());
app.use(express.static('public'));

// bodyParser configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



// Users Route
app.get('/api/users', (req, res) => {
	User.find({}, (err, data) => {
		
		if (!data) {
			res.send("No users");
		} else {
			res.json(data);
		}
	});
});

app.post('/api/users', (req, res) => {
	console.log(req.body.username);
	const username = req.body.username;
	
	if (username === '') {
		return res.send(`Path "username" is required.`);
	}
	
	User.findOne({ username }, (err, data) => {
		
		if (data) {
			return res.send('This username already exists!');
		}
	});
	
	new User({ username })
			.save()
			.then(doc => res.json({ username: doc.username, _id: doc.id }))
			.catch(err => res.json(err));
});



// Exercices
app.post('/api/users/:_id/exercises', (req, res) => {
	console.log(req.body);
	let { description, duration } = req.body;
	
	console.log('req.params.....', req.params);
	let userId = req.params;
	console.log('userId.....', userId);
	   
	
	// Data validation
	let dateInput = req.body.date;
	if (dateInput === '') {
		dateInput = new Date();
	} else {
		const timestamp = Date.parse(dateInput);
		console.log('timestamp', timestamp);
		
		if (isNaN(timestamp) == false) {
			dateInput = new Date(timestamp);
		} else {
			return res.send(`Cast to date failed for value ${dateInput} at path "date"`);
		}
	}

	// Other fields validation
	if (description === '') {
		return res.send(`Path "description" is required.`);
	}
	if (duration === '') {
		return res.send(`Path "duration" is required.`);
	}
	
	
	let newExercise = new Exercise({
		description,
		duration: parseInt(duration),
		date: dateInput
	});
	
	User.findByIdAndUpdate(
		userId,
		{ $push: { log: newExercise }},
		{ new: true },
		(error, updatedUser) => {
			let responseObject = {};
			responseObject['_id'] = updatedUser.id;
			responseObject['username'] = updatedUser.username;
			responseObject['date'] = new Date(newExercise.date).toDateString();
			responseObject['description'] = newExercise.description;
			responseObject['duration'] = newExercise.duration;
			
			res.json(responseObject);
		});
});


app.get('/api/users/:id/logs', (req, res) => {
	console.log("req.params....", req.params);
	console.log("req.query.....", req.query);
	
	const { id } = req.params;
	const { from = null, to = null, limit = null } = req.query;
	
	User.findById(id, (err, data) => {
		
		if (!data) {
			res.send('Unknown user Id');
		} else {
			const userLogs = data.log.map((cur) => {
				console.log(cur);
				
				return {
					description: cur.description,
					duration: parseInt(cur.duration),
					date: cur.date.toDateString()
				};
			});
			
			let responseObject = {
				_id: data.id,
				username: data.username,
				count: data.log.length,
				log: userLogs
			};
					
			
			
			console.log({"from": from, "to": to, "limit": limit });
			
			
			// DATE FILTERS
			if (from || to) {
				// Maximum range dates
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
				
				responseObject.log = responseObject.log.filter((exercise) => {
					let exerciseDate = new Date(exercise.date).getTime();
					
					return exerciseDate >= fromDate && exerciseDate <= toDate;
				});
			}
			
			// LIMIT FILTERS
			if (limit) {
				responseObject.log = responseObject.log.slice(0, limit);
			}
			
			
			res.json(responseObject);
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










