/**
 * Displays the desired error in a fullscreen pane (also permanent if desired) with a custom error message
 * for the console
 * @param {string} userMessage The message to be displayed it the fullscreen pane
 * @param {string | any[]} consoleMessage The list of arguments or the message to be displayed in the console
 * @param {boolean} halt Whether this error should stop every script execution and open a permanent pane
 * @param {() => void} [callback] The action to be executed after the user closes the error pane
 * @returns {void}
 */
function showError(userMessage, consoleMessage, halt, callback) {
	if (halt) {
		panes.openPermaPane('errors')
		document.querySelector('.pane.errors .message').textContent = userMessage

		if (typeof (consoleMessage) === 'string') {
			throw new Error(consoleMessage)
		} else {
			console.error(...consoleMessage)
			throw new Error('Halt caused by an error, see previous log')
		}
	}

	panes.openPane('errors')
	document.querySelector('.pane.errors .message').textContent = userMessage
	console.error(...consoleMessage)
}

/** @returns {void} */
function openHelp() {
	if (!panes.openPane('help')) {
		return
	}

	window.localStorage.setItem('hideHelp', 'false')
}

/** @returns {void} */
function closePanes() {
	panes.closePanes()
}
