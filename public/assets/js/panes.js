/**
 * Pane closure timer
 */
const closePanesTimer = 500 //ms

/**
 * Panes handle the fullscreen panes hiding behind the game
 * to display additional informations
 * Its also possible to bring to the foreground a pane and lock
 * is there (es: if a fatal error occurs and the user should not
 * interact with the window even more)
 */
class Panes {
	/**
	 * Creates a Panes collection from the document fetching all the pane divs
	 * under the fullscreen-panes element
	 */
	constructor() {
		/** @type {Element} */
		this.parent = document.querySelector('.fullscreen-panes')
		this.parent.addEventListener('click', e => {
			if (e.target != this.parent || this.state === 'perma') {
				return
			}

			this.closePanes()
		})

		/** @type {Element[]} */
		this.panes = []
		this.parent.querySelectorAll('.pane').forEach(e => this.panes.push(e))
		
		/** @type {'ready' | 'changing' | 'perma'} */
		this.state = 'ready'
	}

	/**
	 * If nothing is changing (like another pane still opening) or no pane
	 * is opened permanently, it closes all the panes bringing them in the
	 * background
	 * 
	 * @returns {void}
	 */
	closePanes() {
		if (this.state !== 'ready') return null

		this.state = 'changing'
		this.parent.classList.add('hidden')

		window.setTimeout(() => {
			this.panes.forEach((e) => {
				e.classList.add('hidden')
			})

			this.state = 'ready'
		}, closePanesTimer)
	}

	/**
	 * If nothign is changing (like another pane still opening or other panes closing),
	 * if opens the specified pane if existing, but it fails if the pane does not exists
	 * or if the are other changes not completed
	 * @param {string} name The name of the pane to be opened
	 * @returns {Element | null} The pane opened if successfull, otherwise null
	 */
	openPane(name) {
		if (this.state !== 'ready') return null

		for (let i = 0; i < this.panes.length; i++) {
			const e = this.panes[i]
			if (e.classList.contains(name)) {
				this.state = 'changing'

				e.classList.remove('hidden')
				this.parent.classList.remove('hidden')

				window.setTimeout(() => {
					this.state = 'ready'
				}, closePanesTimer)

				return e
			}
		}

		return null
	}

	/**
	 * If nothign is changing (like another pane still opening or other panes closing),
	 * if opens permanently the specified pane if existing, making every other opening
	 * or closing unsuccessful, but it fails if the pane does not exists
	 * or if the are other changes not completed
	 * @param {string} name The name of the pane to be opened
	 * @returns {Element | null} The pane opened if successfull, otherwise null
	 */
	openPermaPane(name) {
		if (this.state !== 'ready') return null

		for (let i = 0; i < this.panes.length; i++) {
			const e = this.panes[i]
			if (e.classList.contains(name)) {
				this.state = 'perma'
				this.parent.classList.add('perma')

				e.classList.remove('hidden')
				this.parent.classList.remove('hidden')

				return e
			}
		}

		return null
	}
}