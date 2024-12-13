const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

class Sprite {
    constructor(src, x = 0, y = 0) {
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y);
    }
}


const bg = new Sprite("img/bg.png");
const fg = new Sprite("img/fg.png", 0, cvs.height - 112);
const bird = new Sprite("img/bird.png", 10, 150);
const pipeUp = new Sprite("img/pipeUp.png");
const pipeBottom = new Sprite("img/pipeBottom.png");

const fly = new Audio("audio/fly.mp3");
const scoreAudio = new Audio("audio/score.mp3");

const gap = 90;
const gravity = 0.1;
const lift = -3.25;
let velocity = 0;
let score = 0;

document.addEventListener("keydown", moveUp);

function moveUp() {
    velocity = lift;
    fly.play();
}


let pipes = [{ x: cvs.width, y: 0 }];

function gameLoop() {
    bg.draw();

    pipes.forEach((pipe, index) => {
        ctx.drawImage(pipeUp.image, pipe.x, pipe.y);
        ctx.drawImage(pipeBottom.image, pipe.x, pipe.y + pipeUp.image.height + gap);

        pipe.x--;

        if (pipe.x === 50) {
            pipes.push({
                x: cvs.width,
                y: Math.floor(Math.random() * pipeUp.image.height) - pipeUp.image.height
            });
        }

        if (
            bird.x + bird.image.width >= pipe.x &&
            bird.x <= pipe.x + pipeUp.image.width &&
            (bird.y <= pipe.y + pipeUp.image.height ||
                bird.y + bird.image.height >= pipe.y + pipeUp.image.height + gap) ||
            bird.y + bird.image.height >= cvs.height - fg.image.height
        ) {
            restartGame();
        }

        if (pipe.x === 5) {
            score++;
            scoreAudio.play();
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipeUp.image.width > 0);

    fg.draw();

    velocity += gravity;
    bird.y += velocity;

    ctx.save();
    ctx.translate(bird.x + bird.image.width / 2, bird.y + bird.image.height / 2);
    const rotationAngle = velocity < 0 ? -45 * Math.PI / 180 : 45 * Math.PI / 180;
    ctx.rotate(rotationAngle);
    ctx.drawImage(bird.image, -bird.image.width / 2, -bird.image.height / 2);
    ctx.restore();

    ctx.fillStyle = "#000";
    ctx.font = "24px Verdana";
    ctx.fillText("Счёт: " + score, 10, cvs.height - 20);
}

function restartGame() {
    bird.y = 150;
    velocity = 0;
    score = 0;
    pipes = [{ x: cvs.width, y: 0 }];
}

setInterval(gameLoop, 16); // ~60 FPS
