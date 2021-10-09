const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');



const app = express();


app.use(cors());
app.use(express.static('public'));

// bodyParser configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//let users = [];
let userId = 0;
let users = [
	{ username: 'Zeca', _id: 1 },
  { username: 'Marcus', _id: 2 },
  { username: 'milzeca', _id: 3 }
];


app.get('/api/users', function(req, res) {
	
	res.send(users);
});

app.post('/api/users', function(req, res) {
	console.log(req.body);
	
	const { username } = req.body;
	console.log(username);
	
	if (!username) {
		return res.send("Insert a user name");
	}
	
	userId++;
	const newUser = {
		username,
		_id: userId
	};
	
	users.push(newUser);
	console.log(users);
	
	res.json(newUser);
});


//let exercises = [];
let exercises = [
	{
		username:"milzeca",
		description:"teste4",
		duration:"40",
		date:"2021-10-08",
		_id:"3"
	},
  {
    username: 'Marcus',
    description: 'teste',
    duration: '20',
    date: '2021-10-09T19:48:32.137Z',
    _id: '2'
  },
  {
    username: 'Zeca',
    description: 'teste2',
    duration: '10',
    date: '2021-10-09T19:48:55.473Z',
    _id: '1'
  },
  {
    username: 'milzeca',
    description: 'teste3',
    duration: '80',
    date: '2021-10-09T19:49:28.711Z',
    _id: '3'
  }
];

app.post('/api/users/:_id/exercises', function(req, res) {
	console.log(req.body);
	const { _id, description, duration } = req.body;
	let { date } = req.body;
	
	console.log(users);
	const username = users.find(user => user._id === parseInt(_id));
	console.log("username: ", username);
	
	if (date === '') {
		date = new Date();
	}
	
	if (username) {
		const exercise = {
			username: username.username, 
			description, 
			duration, 
			date,
			_id
		};
		console.log(exercise);
	
		exercises.push(exercise);
		console.log(exercises);
		
		res.send(exercise);
	} else {
		return res.send(`Cast to ObjectId failed for value ${_id} at path "_id" for model "Users"`);
	}
	
});


app.get('/api/users/:_id/logs', function(req, res) {
	const { _id } = req.params;
	console.log('logRoute -> _id ', _id);
	console.log('typeof _id', typeof _id);
	
	const user = users.find(user => user._id === parseInt(_id));
	console.log(user);
	
	
	// console.log(exercises);
	// const userExercises = exercises.filter(exercise => exercise._id === _id);
	// console.log('userExercises list');
	// console.log(userExercises);
	
	
	
	console.log(exercises);
	
	let tempLog = [];
	for (let i=0; i < exercises.length; i++) {
		if (i._id !== _id) {
			continue;
		} else {
			let temp = { 
				description: exercise.description,
				duration: exercise.duration, 
				date: exercise.date 
			};
		
			tempLog.push(temp);
		}
	}
	
	
	
	
	// const exercisesLog = userExercises.map(cur => {
		// let temp = { description: cur.description, duration: cur.duration, date: cur.date };
		
		// return temp;
	// });
	// console.log('exercisesLog');
	// console.log(exercisesLog);
	
	
	// const log = {
		// username: user.username,
		// count: userExercises.length,
		// _id: _id,
		//log: userExercises
	// };
	
	res.status(200).send('log');
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})










