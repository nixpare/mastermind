function setup() {
  createCanvas(700, 700);
  background(0);
}

function draw() {
  if (mouseIsPressed) {
    fill(255, 0, 0);
    circle(mouseX, mouseY, 30);
  }
}
