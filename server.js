const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cors());
app.use('/public', express.static('public'));

var resObj = {
	isMine: false,
	mineAround: 0,
	score: 0,
	isGameOver: false,
	isPlayerWin: false
}

var cordsOfMine = {
	cords: []
}

//Описание логики
var Point = function () {
	this.isMine = false;
	this.mineAround = 0;
	this.isOpen = false;
};

var game = {
	width: 5,
	height: 5,
	closedCellsCount: 25,
	mineCount: 5,
	field: [],
	isGameOver: false,
	isPlayerWin: false,
	score: 0,

	fillField: function () {
		this.field = [];
		for (var i = 0; i < this.width; i++) {
			var tmp = [];
			for (var j = 0; j < this.height; j++) {
				tmp.push(new Point());
			}
			this.field.push(tmp);
		}
	},

	minePlacement: function () {
		for (var i = 0; i < this.mineCount;) {
			var x = parseInt(Math.random() * this.width - 0.001);
			var y = parseInt(Math.random() * this.height - 0.001);
			if (!this.field[x][y].isMine) {
				this.field[x][y].isMine = true;
				i++;
			}
		}
	},

	mineAroundCounter: function () {
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				var count = 0;
				for (var m = 0; m < this.width; m++) {
					for (var n = 0; n < this.height; n++) {
						if (this.field[m][n].isMine && (m >= i - 1 && m <= i + 1) && (n >= j - 1 && n <= j + 1) && !(i === m && j === n)) count++;
					}
				}
				this.field[i][j].mineAround = count;
			}
		}
	},

	step: function (x, y) {
		if (!this.field[x][y].isOpen) {
			if (!this.field[x][y].isMine && this.closedCellsCount > this.mineCount) {
				resObj.score += 5;
				resObj.isMine = false;
				resObj.mineAround = this.field[x][y].mineAround;
				this.field[x][y].isOpen = true;
				this.closedCellsCount--;
				if (this.closedCellsCount <= this.mineCount) {
					resObj.isPlayerWin = true;
					this.isPlayerWin = true;
				}
			} else {
				resObj.isMine = true;
				resObj.isGameOver = true;
				this.isGameOver = true;
			}
		}
	},

	start: function () {
		this.fillField();
		this.minePlacement();
		this.mineAroundCounter();
		console.log(this.field);
	}
}

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/step', urlencodedParser, function (req, res) {
	var cords = JSON.parse(req.body.x);
	game.step(cords[0], cords[1]);
	res.send(JSON.stringify(resObj));
});

app.post('/showEnd', urlencodedParser, function (req, res) {
	var c = 0;
	for (var i = 0; i < game.width; i++) {
		for (var j = 0; j < game.height; j++) {
			if (game.field[i][j].isMine) {
				cordsOfMine.cords[c] = i * game.width + j;
				c++;
			}
		}
	}
	res.send(JSON.stringify(cordsOfMine));
});

app.post('/restart', urlencodedParser, function (req, res) {
	resObj.score = 0;
	resObj.isGameOver = false;
	resObj.isPlayerWin = false;
	game.isPlayerWin = false;
	game.isGameOver = false;
	game.closedCellsCount = 25;
	game.score = 0;
	game.field = [];
	game.start();
});

app.listen(PORT, function () {
	console.log(`Listening on ${PORT}`);
});