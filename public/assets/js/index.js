const rows = 10;
const n = 5;

let gameBoard = document.querySelector('.game-board')
let row = document.querySelector('.row')

// pill
let pill = row.querySelector('.pill')
let circle = row.querySelector('.circle')

for (let i = 1; i < n; i++) {
	pill.innerHTML += circle.outerHTML;
}

// result
let result = row.querySelector('.result')
let box = row.querySelector('.box')

for (let i = 1; i < n; i++) {
	result.innerHTML += box.outerHTML;
}

for (let i = 1; i < rows; i++) {
	gameBoard.innerHTML += row.outerHTML
}

row = document.querySelector('.row')
row.classList.add('active')

/** @type{ HTMLElement } */
let sel = document.querySelector('.color-select')
/** @type{ HTMLElement | null } */
let selectedCircle = null

function showSelection(/** @type{ HTMLElement } */ elem) {
	sel.style.top = elem.offsetTop + elem.offsetHeight + (sel.offsetHeight * 0.85) + "px"
	sel.style.left = elem.offsetLeft + (elem.offsetWidth / 2) + "px"
	
	selectedCircle = elem
}

function hideSelection() {
	sel.style.top = ''
	sel.style.left = ''
	
	selectedCircle = null
}

sel.querySelectorAll('.circle').forEach(e => {
	e.addEventListener('click', (ev) => {
		selectedCircle.className = ev.target.className
		hideSelection()
	})
})

document.querySelectorAll('.pill .circle').forEach(e => {
	e.addEventListener('click', (ev) => {
		if (ev.target == selectedCircle) {
			hideSelection()
			return
		}

		showSelection(ev.target)
	})
})

document.querySelector('.game').addEventListener('click', (ev) => {
	if (ev.target.classList.contains('game') || ev.target.classList.contains('game-board') || ev.target.classList.contains('row')) {
		hideSelection()
	}
})
