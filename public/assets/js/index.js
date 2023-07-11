/**
 * Letter reveal timer
 */
const showTimer = 350 //ms
/**
 * Letter wobble timer when wrong
 */
const wobbleTimer = 300 //ms
/**
 * Name of the saved stats in localStorage
 */

const panes = new Panes()

/** @type {HTMLButtonElement} */
const darkModeSwitch = document.querySelector('button.darkmode-switch')

darkModeSwitch.onclick = () => {
	if (document.body.classList.contains('dark')) {
		document.body.classList.remove('dark')
		localStorage.setItem('dark-mode', 'false')
	} else {
		document.body.classList.add('dark')
		localStorage.setItem('dark-mode', 'true')
	}
}

if (window.matchMedia && window.matchMedia('').addEventListener) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		if (e.matches && !document.body.classList.contains('dark')) {
			darkModeSwitch.click()
			return
		}
	
		if (!e.matches && document.body.classList.contains('dark')) {
			darkModeSwitch.click()
			return
		}
	})
	
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		if (window.localStorage.getItem('dark-mode') != 'false') {
			darkModeSwitch.click()
		}
	} else {
		if (window.localStorage.getItem('dark-mode') == 'true') {
			darkModeSwitch.click()
		}
	}
}

window.setTimeout(() => {
	document.body.classList.add('ready')
}, 200)

let hideHelp = window.localStorage.getItem('hideHelp')
if (hideHelp == null || hideHelp == 'false') {
	openHelp()
	window.localStorage.setItem('hideHelp', 'true')
}

document.getElementById('openHelp').addEventListener('click', () => {
	openHelp()
})

let mastermind = new Mastermind()
mastermind.start()
