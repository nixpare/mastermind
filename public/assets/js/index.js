/** @type{ HTMLElement } */ 
let sel = document.querySelector('.color-select')

/** @type{ HTMLElement[] } */ 
let circles = document.querySelectorAll('.circle');
circles.forEach(e => {
	e.addEventListener('click', () => {
		sel.style.top = e.offsetTop + e.offsetHeight + (sel.offsetHeight * 0.85) + "px"
		sel.style.left = e.offsetLeft + (e.offsetWidth / 2) + "px"
	})
})