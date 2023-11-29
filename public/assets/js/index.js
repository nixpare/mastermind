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

/** @type{ HTMLElement[] } */ 
let circles = document.querySelectorAll('.pill .circle')
circles.forEach(e => {
	e.addEventListener('click', () => {
		sel.style.top = e.offsetTop + e.offsetHeight + (sel.offsetHeight * 0.85) + "px"
		sel.style.left = e.offsetLeft + (e.offsetWidth / 2) + "px"
	})
})

let game = document.querySelector('.game')
game.addEventListener('click', (ev) => {
	if (ev.target.classList.contains('game') || ev.target.classList.contains('game-board') || ev.target.classList.contains('row')) {
		sel.style.top = '';
		sel.style.left = '';
	}
})

