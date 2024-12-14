
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = window.innerHeight;

const worldHeight = 4000;

// крюк
let hookX = canvas.width / 2.165;
let hookY = 0;
let hookSpeed = 300;
let hookMovingDown = false;
let hookMovingUp = false;
let maxDepth = 2000;

let score = 0;

let cameraY = 0;

const fishCount = 40;

let fishArray = [];

function loadFishImage(index) {
    const img = new Image();
    img.src = `img/Рыба-${index}.png`;
    img.onload = () => (img.loaded = true);
    img.onerror = () => console.error(`Failed to load image: img/Рыба-${index}.png`);

    return img;
}

// созданиt рыб
function createFishArray() {
    fishArray = [];
    for (let i = 0; i < fishCount; i++) {
        const fishImageIndex = (i % 5) + 1;
        const fishWidth = Math.random() * (250 - 50) + 50;
        const fishHeight = fishWidth/0.5;

        fishArray.push({
            x: Math.random() * (canvas.width - fishWidth),
            y: Math.random() * worldHeight,
            width: fishWidth,
            height: fishHeight,
            caught: false,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            image: loadFishImage(fishImageIndex)
        });
    }
}
createFishArray();

// Элементы управления
const dropHookBtn = document.getElementById('dropHookBtn');
const upgradeDepthBtn = document.getElementById('upgradeDepthBtn');
const scoreDisplay = document.getElementById('score');
const maxDepthDisplay = document.getElementById('maxDepth');

dropHookBtn.addEventListener('click', () => {
    if (!hookMovingDown && !hookMovingUp) {
        hookMovingDown = true;
    }
});

upgradeDepthBtn.addEventListener('click', () => {
    if (score >= 100) {
        score -= 100;
        maxDepth += 100;
        scoreDisplay.textContent = score;
        maxDepthDisplay.textContent = maxDepth;
    }
});

let lastTime = 0;
function update(deltaTime) {
    const hookDelta = (hookSpeed * deltaTime) / 1000;

    if (hookMovingDown) {
        hookY += hookDelta;

        if (hookY >= maxDepth) {
            hookMovingDown = false;
            hookMovingUp = true;
        }
    } else if (hookMovingUp) {
        hookY -= hookDelta;

        fishArray.forEach(fish => {
            if (
                hookX < fish.x + fish.width &&
                hookX + 10 > fish.x &&
                hookY < fish.y + fish.height &&
                hookY + 20 > fish.y &&
                !fish.caught
            ) {
                fish.caught = true;
                score += 10;
                scoreDisplay.textContent = score;
            }
        });

        if (hookY <= 0) {
            hookMovingUp = false;
            hookY = 0;
            createFishArray(); 
        }
    }

    moveFish(deltaTime);
    
    cameraY = Math.min(
        Math.max(hookY - canvas.height / 2, 0),
        worldHeight - canvas.height
    );

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   
    ctx.fillStyle = '#BABF9E'; // Цвет крюка
    ctx.beginPath();
    ctx.arc(hookX, hookY - cameraY, 10, 0, Math.PI * 2); // Рисуем круг
    ctx.fill();
    ctx.closePath();

    fishArray.forEach(fish => {
        if (!fish.caught && fish.image.loaded) {
            ctx.save();

            
            if (fish.speedX < 0) {
                ctx.scale(-1, 1); // Отражение по горизонтали
                ctx.drawImage(
                    fish.image,
                    -fish.x - fish.width, // Изменение позиции для зеркального отображения
                    fish.y - cameraY,
                    fish.width,
                    fish.height
                );
            } else {
                ctx.drawImage(
                    fish.image,
                    fish.x,
                    fish.y - cameraY,
                    fish.width,
                    fish.height
                );
            }

            ctx.restore();
        }
    });
}

function moveFish(deltaTime) {
    const fishDelta = (50 * deltaTime) / 1000;
    fishArray.forEach(fish => {
        fish.x += fish.speedX * fishDelta;
        fish.y += fish.speedY * fishDelta;

        if (fish.x <= 0 || fish.x + fish.width >= canvas.width) {
            fish.speedX = -fish.speedX;
        }
        if (fish.y <= 0 || fish.y + fish.height >= worldHeight) {
            fish.speedY = -fish.speedY;
        }
    });
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    update(deltaTime);

    requestAnimationFrame(gameLoop);
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && hookX > 0) {
        hookX -= 20;
    } else if (e.key === 'ArrowRight' && hookX < canvas.width - 10) {
        hookX += 20;
    }
});

requestAnimationFrame(gameLoop);
