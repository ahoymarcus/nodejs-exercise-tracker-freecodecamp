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

app.post('/api/users/:_id/exercises', function(req, res) {
	console.log(req.body);
	const { _id, description, duration, date } = req.body;
	
	console.log(users);
	const username = users.find(user => user._id === parseInt(_id));
	console.log("username: ", username);
	
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









const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})










