
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

	/** @type { Promise<string[] | null> | null } */
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

		this.rows = [];
		for (let i = 0; i < rows; i++) {
			const row = new Row(this, n);
			this.rows.push(row);
		}
		this.rowIdx = 0;

		this.secret = this.#generateColors(n);
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

	/**
	 * @param {string[]} colors 
	 */
	#initSelector(colors) {
		this.selector = this.gameBoard.querySelector('.color-select');
		const selectorDiv = this.selector.querySelector('div');

		colors.forEach(color => {
			const circle = document.importNode(circleButtonTemplate, true);
			circle.classList.add(color);
			circle.addEventListener('click', (ev) => {
				// @ts-ignore
				this.selectedCircle.html.className = ev.target.className;
				this.selectCircle(null);
			})

			selectorDiv.appendChild(circle);
		})
	}

	/**
	 * @param { number } n
	 * @returns { Promise<string[] | null> }
	 */
	async #generateColors(n) {
		const resp = await fetch('/secret/' + n).catch(err => console.error(err));
		if (!resp) {
			return null;
		}

		if (!resp.ok) {
			console.error('Failed to generate secret');
			return null;
		}

		const { colors, secret } = await resp.json();

		this.#initSelector(colors);
		return secret;
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

	async lose() {
		clearInterval(this.timer);
		this.header.innerText = 'You lost ...';

		/** @type {HTMLElement} */
		const result = document.importNode(rowTemplate.querySelector('.pill'), true);
		(await this.secret).forEach(color => {
			const circle = document.importNode(circleTemplate, true);
			circle.classList.add(color);
			result.appendChild(circle);

			console.log(circle);
		})

		result.style.marginTop = '1.5rem';
		result.style.fontSize = '0.8em';

		this.header.appendChild(result);
	}
}

/** @type {HTMLElement} */ // @ts-ignore
const template = document.getElementById("template").content;
/** @type {HTMLButtonElement} */
const circleButtonTemplate = template.querySelector('button.circle');
/** @type {HTMLDivElement} */
const rowTemplate = template.querySelector('.row');
/** @type {HTMLDivElement} */
const circleTemplate = template.querySelector('div.circle');
/** @type {HTMLDivElement} */
const boxTemplate = template.querySelector('.box');

class Row {

	/** @type { HTMLElement } */
	html

	/** @type { Game } */
	game

	/** @type { HTMLButtonElement } */
	sendButton

	/** @type { boolean } */
	checking

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
		this.sendButton.addEventListener('click', () => { this.check() });

		this.html.querySelector('.clear-btn').addEventListener('click', () => {
			if (!this.isActive()) {
				return;
			}

			for (let circle of this.circles) {
				circle.setColor('');
			}
		});

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

	async wiggleSendButton() {
		this.sendButton.classList.add('wiggle');
		await sleep(1000);
		this.sendButton.classList.remove('wiggle');
	}

	async check() {
		if (this.checking) {
			return;
		}
		this.checking = true;

		/** @type { string[] } */
		var colors = [];

		for (let circle of this.circles) {
			if (!circle.isColored()) {
				await this.wiggleSendButton();
				this.checking = false;
				return;
			}

			const color = circle.getColor();
			if (colors.includes(color)) {
				await this.wiggleSendButton();
				this.checking = false;
				return;
			}
			colors.push(color);
		}

		this.deactivate();

		var secret = [...await this.game.secret];
		var resultIdx = 0;

		for (let i = 0; i < colors.length; i++) {
			for (let j = 0; j < secret.length; j++) {
				if (secret[j] == colors[i] && j == i) {
					this.boxes[resultIdx].correct();
					resultIdx ++;

					delete secret[j];
					delete colors[i];

					await sleep(sleepTime);
					break;
				}
			}
		}

		colors = colors.filter(s => s != undefined)
		secret = secret.filter(s => s != undefined)

		if (secret.length == 0) {
			this.game.win();
			return;
		}

		for (let color of colors) {
			for (let j = 0; j < secret.length; j++) {
				if (secret[j] == color) {
					this.boxes[resultIdx].close();
					resultIdx ++;

					delete secret[j];

					await sleep(sleepTime);
					break;
				}
			}
		}

		this.game.rowIdx ++;
		if (this.game.rowIdx == this.game.rows.length) {
			this.game.lose();
		}

		this.game.rows[this.game.rowIdx].activate();
		this.checking = false;
	}
}

const sleepTime = 200;

/**
 * @param {number} ms 
 * @returns Promise<any>
 */
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

	/**
	 * @returns {string}
	 */
	getColor() {
		return this.html.className.replace('circle ', '');
	}

	/**
	 * @param {string} color 
	 */
	setColor(color) {
		this.html.className = 'circle ' + color;
	}

	/**
	 * @returns {boolean}
	 */
	isColored() {
		return this.html.className != 'circle';
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

const rows = 8;
const n = 5;

const game = new Game(rows, n);
