var game = {
	width: 5,
	height: 5,
	isGameOver: false,
	isPlayerWin: false,
	bufId: 0
}

var endGame = function () {
	var el;
	for (var i = 0; i < game.width; i++) {
		for (var j = 0; j < game.height; j++) {
			el = document.getElementById(i * game.height + j);
			el.className = 'opened';
		}
	}
}

var showAllMines = function (mineCords) {
	var el;
	var mine;

	for (var i = 0; i < game.width; i++) {
		mine = document.createElement('img');
		mine.setAttribute('src', 'mine.png');
		el = document.getElementById(mineCords.cords[i]);
		el.appendChild(mine);
	}
}

var reqToShowAllMines = function () {
	fetch('http://127.0.0.1:5000/showEnd', {
		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		}
	})
		.then(function (res) {
			return res.json();
		})
		.then(function (mineCords) {
			showAllMines(mineCords);
		});
}

var restartGame = function () {
	var el;
	game.isGameOver = false;
	game.isPlayerWin = false;
	for (var i = 0; i < game.width; i++) {
		for (var j = 0; j < game.height; j++) {
			el = document.getElementById(i * game.width + j);
			el.innerHTML = '';
			el.className = 'close';
		}
	}
	el = document.getElementById('score');
	el.innerHTML = 'SCORE: 0';

	fetch('http://127.0.0.1:5000/restart', {
		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		}
	})

}

var page = {
	stepOnThePage(resObj) {
		var el = document.getElementById(game.bufId);
		if (!resObj.isMine) {
			el.innerHTML = resObj.mineAround;
			el.className = 'opened';
			el = document.getElementById('score');
			el.innerHTML = 'SCORE: ' + resObj.score;
		} else {
			game.isGameOver = true;
			endGame();
			reqToShowAllMines();
			alert('You lose. Game Over.')
		}

		if (resObj.isPlayerWin) {
			game.isPlayerWin = true;
			endGame();
			reqToShowAllMines();
			alert('Congratulations! You won!');
		}
	},

	eventClick: function (eventObject) {
		if (!game.isGameOver && !game.isPlayerWin) {
			var clickedElement = eventObject.currentTarget;
			if (clickedElement.className === 'close') {
				game.bufId = clickedElement.id;
				var x = Math.floor(clickedElement.id / game.height);
				var y = clickedElement.id % game.height;

				//Запрос на проверку нажатого поля 
				fetch('http://127.0.0.1:5000/step', {
					method: 'POST',
					headers: {
						'Content-type': 'application/x-www-form-urlencoded'
					},
					body: `x=${JSON.stringify([x, y])}`
				})
					.then(function (res) {
						return res.json();
					})
					.then(function (resObj) {
						page.stepOnThePage(resObj);
					});
			}

		}
	},

	createField: function () {
		var element = document.getElementById('block');
		var but;
		for (var i = 0; i < game.height * game.width; i++) {
			but = document.createElement('button');
			element.appendChild(but);
			but.id = i;
			but.value = i;
			but.className = 'close';
			but.addEventListener('click', this.eventClick);
		}
		element = document.getElementById('mines');
		element.innerHTML = "MINE: " + "5";
		but = document.getElementById('restart');
		but.addEventListener('click', restartGame);
	}
}

window.onload = function () {
	page.createField();
	fetch('http://127.0.0.1:5000/restart', {
		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded'
		}
	})
}