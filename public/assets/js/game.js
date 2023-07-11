/**
 * WordRow reflects the game row with references to the corresponding
 * html elements of the word row and each letter
 * @typedef {Object} WordRow
 * @property {string} content
 * @property {HTMLElement} word
 * @property {HTMLElement[]} letters
 */

/**
 * State can be used to describe the state of the game
 * @typedef {'never-started' | 'running' | 'paused' | 'won' | 'lost'} State
 */

/**
 * Color is the set of colors in the game
 * @typedef {'red', 'blue', 'green', 'white', 'black', 'yellow', 'purple', 'orange'} Color
 */

/**
 * Game main object
 */
class Mastermind {
	constructor() {
		/** @type {number} */
		this.row = 0
		/** @type {[]Color} */
		this.secretColors
		/** @type {State} */
		this.state = 'never-started'
		/** @type {HTMLElement} */
		this.grid = document.querySelector('.grid')
		/** @type {WordRow[]} */
		this.words = []
		/** @type {Stats} */
		this.stats
	}

	/** @returns {boolean} */
	isRunning() {
		return this.state === 'running'
	}

	/** @returns {void} */
	start() {
		if (this.isRunning()) {
			return
		}

		
	}

	/** @returns {void} */
	getColors() {
		// Faccio il controllo del tentativo
	}

	/**
	 * @param {Color} color
	 * @param {int} index
	 * @returns {void}
	 */
	setColor(color, index) {
		
	}

	/** @returns {void} */
	checkRow() {
		// Funzione di controllo quando premo invio prima di controllare
		// il tentativo
	}

	/**
	 * @param {number} row 
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	scanRow(row, callback) {
		// ??
		let wordTry = this.words[row].content;

		let res = ['wrong', 'wrong', 'wrong', 'wrong', 'wrong'];
		let secretCopy = this.secretWord;

		for (let i = 0; i < 5; i++) {
			if (wordTry[i] === secretCopy[i]) {
				res[i] = 'correct';
			}
		}

		for (let i = 0; i < 5; i++) {
			if (res[i] === 'correct') {
				wordTry = setCharAt(wordTry, i, '_');
				secretCopy = setCharAt(secretCopy, i, '_');
			}
		}

		for (let i = 0; i < 5; i++) {
			if (wordTry[i] == '_') {
				continue;
			}

			let j = secretCopy.search(wordTry[i]);
			if (j >= 0) {
				secretCopy = setCharAt(secretCopy, j, '_');
				res[i] = 'close';
			}
		}

		res.forEach((value, index) => {
			window.setTimeout(() => {
				this.words[row].letters[index].classList.add(value)

				let kbLetter = document.getElementById(this.words[row].content.at(index))
				switch (value) {
					case 'correct':
						kbLetter.classList.remove('close')
						kbLetter.classList.remove('wrong')
						kbLetter.classList.add('correct')
						break
					case 'close':
						if (!kbLetter.classList.contains('correct')) {
							kbLetter.classList.remove('wrong');
							kbLetter.classList.add('close')
						}
						break
					case 'wrong':
						if (!kbLetter.classList.contains('correct') && !kbLetter.classList.contains('close')) {
							kbLetter.classList.add('wrong')
						}
						break
				}
			}, showTimer * index);
		})

		window.setTimeout(callback, showTimer * 5)
	}

	/** @returns {Promise<void>} */
	wobbleRow() {
		this.words[this.row].word.classList.add('wobble')
		return new Promise(resolve => window.setTimeout(() => {
			this.words[this.row].word.classList.remove('wobble')
			resolve()
		}, wobbleTimer))
	}

	/** @returns {void} */
	win() {
		this.stats.wins++
		this.stats.results[this.row]++

		this.stats.streak++
		this.stats.lastWon = this.stats.lastPlayed

		if (this.stats.streak > this.stats.maxStreak) {
			this.stats.maxStreak = this.stats.streak
		}

		this.updateStats()
		this.state = 'won'

		let result = document.querySelector('.result')
		result.querySelector('.excl').innerHTML = "Fantastico!"
		result.querySelector('.solution').innerHTML = 'Hai indovinato la parola!'
		result.classList.remove('hidden')

		this.endGame()
	}

	/** @returns {void} */
	lose() {
		this.stats.streak = 0
		this.updateStats()
		this.state = 'lost'

		let result = document.querySelector('.result')
		result.querySelector('.excl').innerHTML = "Peccato!"
		result.querySelector('.solution').innerHTML = 'La parola era <a href="https://www.google.com/search?q=definizione+' + this.realSecretWord + '" target="_blank"><b>' + this.realSecretWord.toUpperCase() + '</b></a>'
		result.classList.remove('hidden')

		this.endGame()
	}

	/** @returns {void} */
	endGame() {
		
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
}