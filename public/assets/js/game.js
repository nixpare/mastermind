
class Game {

	/** @type { HTMLElement } */
	html

	/** @type { HTMLElement } */
	header
	
	/** @type { HTMLElement } */
	gameBoard

	/** @type { HTMLElement } */
	selector

	/** @type { Row[] } */
	rows

	/** @type { number } */
	rowIdx

	/** @type { Circle | null } */
	selectedCircle

	/** @type { string[] } */
	secret

	/** @type { number } */
	timer

	/**
	 * @param { number } rows
	 * @param { number } n
	 */
	constructor(rows, n) {
		this.html = document.querySelector('.game');
		this.header = this.html.querySelector('.game-header');

		this.html.addEventListener('click', (ev) => {
			if (ev.target == this.html || ev.target == this.gameBoard) {
				this.selectCircle(null);
				return;
			}

			for (let i = 0; i < this.rows.length; i++) {
				if (this.rows[i].html == ev.target) {
					this.selectCircle(null);
					return;
				}
			}
		})

		this.gameBoard = document.querySelector('.game-board');
		this.#initSelector();

		this.rows = [];
		for (let i = 0; i < rows; i++) {
			const row = new Row(this, n);
			this.rows.push(row);
		}
		this.rowIdx = 0;

		this.#generateSecret(n);
		this.rows[this.rowIdx].activate();

		/** @type { HTMLElement } */
		const timerHTML = document.querySelector('[timer-value]');
		var minutes = 0;
		var seconds = 0;
		this.timer = setInterval(() => {
			seconds ++;

			if (seconds == 60) {
				minutes ++;
				seconds = 0;
			}

			if (minutes == 0) {
				// @ts-ignore
				timerHTML.innerText = seconds + 's';
			} else {
				// @ts-ignore
				timerHTML.innerText = minutes + 'm ' + seconds + 's';
			}
		}, 1000)
	}

	#initSelector() {
		this.selector = this.gameBoard.querySelector('.color-select');
		this.selector?.querySelectorAll('.circle').forEach(e => {
			e.addEventListener('click', (ev) => {
				// @ts-ignore
				this.selectedCircle.html.className = ev.target.className;
				this.selectCircle(null);
			})
		})
	}

	async #generateSecret(n) {
		const resp = await fetch('/secret/' + n).catch(err => console.error(err));
		if (!resp) {
			return;
		}

		if (!resp.ok) {
			console.error('Failed to generate secret');
			return;
		}
		
		this.secret = await resp.json();
	}

	selectCircle(/** @type { Circle } */ circle) {
		if (!circle) {
			this.selector.style.top = ''
			this.selector.style.left = ''
			this.selectedCircle = null

			return;
		}

		this.selector.style.top = circle.html.offsetTop + circle.html.offsetHeight + (this.selector.offsetHeight * 0.85) + "px"
		this.selector.style.left = circle.html.offsetLeft + (circle.html.offsetWidth / 2) + "px"
		this.selectedCircle = circle;
	}

	win() {
		clearInterval(this.timer);
		this.header.innerText = 'You won!';
	}

	lose() {
		clearInterval(this.timer);
		this.header.innerText = 'You lost ...';

		/** @type {HTMLElement} */
		const result = document.importNode(rowTemplate.querySelector('.pill'), true);
		this.secret.forEach(color => {
			const circle = document.importNode(circleTemplate, true);
			circle.className = 'circle ' + color;
			result.appendChild(circle);
		})

		result.style.marginTop = '1.5rem';
		result.style.fontSize = '0.8em';

		this.header.appendChild(result);
	}
}

/** @type {HTMLElement} */ // @ts-ignore
const rowTemplate = document.getElementById("row-template").content.children.item(0);
/** @type {HTMLElement} */ // @ts-ignore
const circleTemplate = document.getElementById("circle-template").content.children.item(0);
/** @type {HTMLElement} */ // @ts-ignore
const boxTemplate = document.getElementById("box-template").content.children.item(0);

class Row {

	/** @type { HTMLElement } */
	html

	/** @type { Game } */
	game

	/** @type { HTMLElement } */
	sendButton

	/** @type { HTMLElement } */
	pill

	/** @type { Circle[] } */
	circles

	/** @type { HTMLElement } */
	result

	/** @type { Box[] } */
	boxes

	/**
	 * @param {Game} game
	 * @param {number} n
	 */
	constructor(game, n) {
		this.game = game;

		this.html = document.importNode(rowTemplate, true);
		this.game.gameBoard.appendChild(this.html);

		this.sendButton = this.html.querySelector('.send-btn');
		const thisRow = this;
		this.sendButton.addEventListener('click', () => { thisRow.check() });

		this.pill = this.html.querySelector('.pill');
		this.circles = [];

		this.result = this.html.querySelector('.result');
		this.boxes = [];

		for (let i = 0; i < n; i++) {
			this.circles.push(new Circle(this));
			this.boxes.push(new Box(this));
		}
	}

	activate() {
		this.html.classList.add('active');
	}

	deactivate() {
		this.html.classList.remove('active');
	}

	isActive() {
		return this.html.classList.contains('active');
	}

	check() {
		this.deactivate();

		const colors = this.circles.map(c => c.html.className).map(c => c.replace('circle ', ''));
		const secret = [...this.game.secret];
		var resultIdx = 0;

		colors.forEach((color, i) => {
			for (let j = 0; j < secret.length; j++) {
				if (secret[j] == color && j == i) {
					this.boxes[resultIdx].correct();
					resultIdx ++;

					delete secret[j];
					delete colors[i];

					break;
				}
			}
		})

		if (secret.filter(s => s != undefined).length == 0) {
			this.game.win();
			return;
		}

		colors.forEach(color => {
			for (let j = 0; j < secret.length; j++) {
				if (secret[j] == color) {
					this.boxes[resultIdx].close();
					resultIdx ++;

					delete secret[j];

					break;
				}
			}
		})

		this.game.rowIdx ++;
		if (this.game.rowIdx < this.game.rows.length) {
			this.game.rows[this.game.rowIdx].activate();
		} else {
			this.game.lose();
		}
	}
}

class Circle {

	/** @type {Row} */
	row

	/** @type { HTMLElement } */
	html

	/**
	 * @param {Row} row 
	 */
	constructor(row) {
		this.row = row;
		
		this.html = document.importNode(circleTemplate, true);
		this.row.pill.appendChild(this.html);

		this.html.addEventListener('click', () => {
			if (!this.row.isActive()) {
				return
			}

			if (this.row.game.selectedCircle == this) {
				this.row.game.selectCircle(null)
			} else {
				this.row.game.selectCircle(this)
			}
		})
	}
}

class Box {

	/** @type { HTMLElement } */
	html

	/**
	 * @param {Row} row 
	 */
	constructor(row) {
		this.html = document.importNode(boxTemplate, true);
		row.result.appendChild(this.html);
	}

	correct() {
		this.html.classList.add('check');
	}

	close() {
		this.html.classList.add('check', 'close');
	}
}

const rows = 10;
const n = 5;

const game = new Game(rows, n);
