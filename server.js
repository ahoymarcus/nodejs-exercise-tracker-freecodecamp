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
	
	userId++;
	const newUser = {
		username,
		_id: userId
	};
	
	users.push(newUser);
	console.log(users);
	
	res.json(newUser);
});









const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})










