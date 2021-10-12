const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const app = express();

mongoose.connect(process.env.MONGODB_SRV || 'mongodb://127.0.0.1:27017/exercise_tracker', { useNewUrlParser: true }, { useUnifiedTopology: true });
// , {useMongoClient: true }

const userSchema = new mongoose.Schema({ username: { type: String, unique: true }});
const User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({ username: String, description: String, duration: Number, date: Date, _id: String });
const Exercise = mongoose.model('Exercise', exerciseSchema);

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
	
	const newUser = new User({ username: req.body.username });
	newUser.save((err, data) => {
		
		if (err) {
			res.json("Username already taken!");
		} else {
			res.json({ "username": data.username, "_id": data.id });
		}
	});
	
});



// Exercices
app.post('/api/users/:id/exercises', (req, res) => {
	console.log(req.body);
	let { _id, description, duration, date } = req.body;
	
	if (!date) {
		date = new Date();
	}
	
	User.findById(_id, (err, data) => {
		console.log(_id);
		
		if (!data) {
			res.send('Unknown userId');
		} else {
			let username = data.username;
			
			let newExercise = new Exercise({ _id, description, duration, date });
			
			newExercise.save((err, data) => {
				res.json({ username, description, duration: +duration, date: new Date(date).toDateString(), _id });
			});
		}
	});
	
});


app.get('/api/users/:id/logs', (req, res) => {
	console.log("req.params....", req.params);
	console.log("req.query.....", req.query);
	
	const { _id } = req.params;
	const { from = null, to = null, limit = null } = req.query;
	
	User.findById(_id, (err, data) => {
		
		if (!data) {
			res.send('Unknown user Id');
		} else {
			const username = data.username;
			
			console.log({"from": from, "to": to, "limit": limit });
		
			Exercise.find({_id}, { date: {$gte: new Date(from), $lte: new Date(to) }}).select(["_id", "description", "duration", "date"]).limit(+limit)
				.exec((err, data) => {
					let customData = data.map(exer => {
						let dateFormatted = new Date(exer.date).toDateString();
						
						return { _id: exer.id, description: exer.description, duration: exer.duration, date: dateFormatted };
					});
					
					if (!data) {
						res.json({
							"_id": _id,
							"username": username,
							"count": 0,
							"log": []
						});
					} else {
						res.json({
							"_id": _id,
							"username": username,
							"count": data.length,
							"log": customData
						});
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










