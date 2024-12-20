const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Адаптивные размеры канваса
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; // 60% высоты экрана
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Глубина игрового поля
const worldHeight = 4000;

// Параметры крюка
let hookX = canvas.width / 2; // Центрируем крюк по ширине
let hookY = 0;
let hookSpeed = 300; // Скорость крюка
let hookMovingDown = false;
let hookMovingUp = false;
let maxDepth = 2000; // Изначальная максимальная глубина

let score = 0;

// Позиция камеры
let cameraY = 0;

// Количество рыб
const fishCount = 40;

// Массив с рыбами
let fishArray = [];

// Загрузка изображения рыбы
function loadFishImage(index) {
    const img = new Image();
    img.src = `img/Рыба-${index}.png`;

    // Устанавливаем флаг для проверки загрузки
    img.onload = () => (img.loaded = true);
    img.onerror = () => console.error(`Failed to load image: img/Рыба-${index}.png`);

    return img;
}

// Функция для создания рыб
function createFishArray() {
    fishArray = [];
    for (let i = 0; i < fishCount; i++) {
        const fishImageIndex = (i % 5) + 1;
        const fishWidth = Math.random() * (2000 * 0.1 - 2000 * 0.05) + 2000 * 0.05; // Адаптивный размер рыбы
        const fishHeight = fishWidth / 2; // Соотношение сторон

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

// Создаем начальный набор рыб
createFishArray();

// Элементы управления
const dropHookBtn = document.getElementById('dropHookBtn');
const upgradeDepthBtn = document.getElementById('upgradeDepthBtn');
const scoreDisplay = document.getElementById('score');
const maxDepthDisplay = document.getElementById('maxDepth');

// Обработчик для сброса крюка
dropHookBtn.addEventListener('click', () => {
    if (!hookMovingDown && !hookMovingUp) {
        hookMovingDown = true;
    }
});

// Обработчик для улучшения глубины
upgradeDepthBtn.addEventListener('click', () => {
    if (score >= 100) {
        score -= 100;
        maxDepth += 100;
        scoreDisplay.textContent = score;
        maxDepthDisplay.textContent = maxDepth;
    }
});

// Игровой цикл
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
            createFishArray(); // Обновляем рыб после броска крюка
        }
    }

    moveFish(deltaTime);

    // Центрируем камеру на крюке
    cameraY = Math.min(
        Math.max(hookY - canvas.height / 2, 0),
        worldHeight - canvas.height
    );

    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем крюк
    ctx.fillStyle = '#BABF9E'; // Цвет крюка
    ctx.beginPath();
    ctx.arc(hookX, hookY - cameraY, 10, 0, Math.PI * 2); // Рисуем круг
    ctx.fill();
    ctx.closePath();

    // Рисуем рыб
    fishArray.forEach(fish => {
        if (!fish.caught && fish.image.loaded) {
            ctx.save();

            // Если рыба плывет влево, отражаем по оси X
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
                // Обычное рисование для движения вправо
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

        // Отскок от краев
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

// Управление крюком
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && hookX > 0) {
        hookX -= 20;
    } else if (e.key === 'ArrowRight' && hookX < canvas.width - 10) {
        hookX += 20;
    }
});

requestAnimationFrame(gameLoop);