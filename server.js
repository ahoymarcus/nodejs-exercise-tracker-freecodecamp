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


let users = [];
let userId = 0;
// let users = [
	// { username: 'Zeca', _id: 1 },
  // { username: 'Marcus', _id: 2 },
  // { username: 'milzeca', _id: 3 }
// ];


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


let exercises = [];
// let exercises = [
	// {username:"milzeca", description:"teste4", 		duration:"40", date:"Thu Oct 07 2021", _id:"3"},
  // {username: 'Marcus', description: 'teste',    duration: '20', date: 'Thu Oct 07 2021', _id: '2' },
  // {username: 'Zeca', description: 'teste2',     duration: '10', date: 'Thu Oct 07 2021', _id: '1'},
  // {username: 'milzeca', description: 'teste3',  duration: '80', date: 'Thu Oct 07 2021', _id: '3'}
// ];

app.post('/api/users/:_id/exercises', function(req, res) {
	console.log(req.body);
	const { _id, description, duration } = req.body;
	let { date } = req.body;
	
	console.log(users);
	const username = users.find(user => user._id === parseInt(_id));
	console.log("username: ", username);
	
	let formattedDate;
	if (date === '') {
		date = new Date();
		formattedDate = date.toDateString();
	} else {
		const miliseconds = Date.parse(date);
		let temp;
		temp = new Date(miliseconds);
		console.log(typeof temp);
		console.log(temp);
		
		formattedDate = temp.toString();
		console.log('typeof formattedDate', typeof formattedDate);
		console.log(formattedDate);
		
		formattedDate = formattedDate.slice(0, 15);
		console.log(formattedDate);
	}
	
	if (username) {
		const exercise = {
			username: username.username, 
			description, 
			duration, 
			date: formattedDate,
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
	
	console.log('......exercises array......');
	console.log(exercises);
		
	const userExercises = exercises
	.filter(exercise => exercise._id === _id)
	.map(cur => {
		let temp = { description: cur.description, duration: parseInt(cur.duration), date: cur.date };
		
		return temp;
	});
	console.log('......userExercises......');
	console.log(userExercises);
	//.toDateString()
	
	const log = {
		username: user.username,
		count: userExercises.length,
		_id: _id,
		log: userExercises
	};
	
	res.status(200).send(log);
});






const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})










