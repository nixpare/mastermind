var ball = {
    x: 200,
    y: 300,
    speedX : 3,
    speedY : -4
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  
}

function draw() {
  background(0);
  
  move();
  bounce();
  display();
}

function move() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
}

function display() {
    ellipse(ball.x, ball.y, 100, 50);
}

function bounce() {
    if (ball.x > width || ball.x < 0) {
        ball.speedX *= -1;
        fill(random(255), random(255), random(255));
    }

    if (ball.y > height || ball.y < 0) {
        ball.speedY *= -1;
        fill(random(255), random(255), random(255));
    }
}
