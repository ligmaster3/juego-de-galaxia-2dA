document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos elementos del DOM
    let nave = document.querySelector('.nave'); // Selección del elemento con clase 'nave'
    let caja = document.querySelector('.caja'); // Selección del elemento con clase 'caja'

    let scoreElement = document.getElementById('score'); // Selección del elemento con id 'score' para mostrar puntuación
    let tiempoElement = document.getElementById('tiempo'); // Selección del elemento con id 'tiempo' para mostrar tiempo restante
    let restartBtn = document.querySelector('.restart'); // Selección del botón con clase 'restart' para reiniciar el juego
    let juegoEnMarcha = true; // Variable que indica si el juego está en marcha
    let enemigos = []; // Array que almacenará los enemigos del juego
    let tiempo = 0; // Tiempo transcurrido inicialmente
    let speed = 1.5; // Velocidad de movimiento inicial
    let score = 0; // Puntuación inicial del juego
    let gameTime = 10; // Duración máxima del juego en segundos
    let gameInterval; // Intervalo del juego para controlar el tiempo y eventos
    let specialEnemy; // Enemigo especial del juego
    let specialEnemyLive = 22; // Vida del enemigo especial
    let specialEnemySpeed = 2; // Velocidad del enemigo especial
    let specialEnemyDirection = 1; // Dirección del movimiento del enemigo especial (1 o -1)
    const initialSpecialEnemyLive = 10; // Vida inicial del enemigo especial

    // Seleccionamos botones de control de la nave
    const btnUp = document.querySelector(".up"); // Botón para mover la nave hacia arriba
    const btnDown = document.querySelector(".down"); // Botón para mover la nave hacia abajo
    const btnLeft = document.querySelector(".left"); // Botón para mover la nave hacia la izquierda
    const btnRight = document.querySelector(".right"); // Botón para mover la nave hacia la derecha
    const btnFire = document.querySelector(".fire"); // Botón para disparar desde la nave
    const btnPausa = document.querySelector('.pausa'); // Botón para pausar o reanudar el juego

    // Event listeners para los botones de control de la nave y otros controles del juego
    btnUp.addEventListener("click", () => moveNave("up")); // Listener para mover la nave hacia arriba al hacer clic
    btnDown.addEventListener("click", () => moveNave("down")); // Listener para mover la nave hacia abajo al hacer clic
    btnLeft.addEventListener("click", () => moveNave("left")); // Listener para mover la nave hacia la izquierda al hacer clic
    btnRight.addEventListener("click", () => moveNave("right")); // Listener para mover la nave hacia la derecha al hacer clic
    btnFire.addEventListener("click", fire); // Listener para disparar desde la nave al hacer clic en el botón de fuego
    restartBtn.addEventListener('click', restartGame); // Listener para reiniciar el juego al hacer clic en el botón de reinicio
    btnPausa.addEventListener("click", toggleGamePause); // Listener para pausar o reanudar el juego al hacer clic en el botón de pausa

    // Event listener para detectar las teclas presionadas
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                moveNave('up'); // Mueve la nave hacia arriba al presionar la flecha hacia arriba
                break;
            case 'ArrowDown':
                moveNave('down'); // Mueve la nave hacia abajo al presionar la flecha hacia abajo
                break;
            case 'ArrowLeft':
                moveNave('left'); // Mueve la nave hacia la izquierda al presionar la flecha hacia la izquierda
                break;
            case 'ArrowRight':
                moveNave('right'); // Mueve la nave hacia la derecha al presionar la flecha hacia la derecha
                break;
            case 'Enter':
                fire(); // Dispara desde la nave al presionar la tecla Enter
                break;
        }
    });

    function moveNave(direction) {
        const step = 20; // Tamaño del paso para el movimiento de la nave
        let left = parseInt(window.getComputedStyle(nave).left); // Posición izquierda actual de la nave
        let top = parseInt(window.getComputedStyle(nave).top); // Posición superior actual de la nave

        // Mueve la nave según la dirección especificada, asegurándose de no salir de los límites de la caja
        if (direction === "left" && left > 0) {
            nave.style.left = `${left - step}px`; // Mueve la nave hacia la izquierda
        } else if (direction === "right" && left < caja.clientWidth - nave.offsetWidth) {
            nave.style.left = `${left + step}px`; // Mueve la nave hacia la derecha
        } else if (direction === "up" && top > 0) {
            nave.style.top = `${top - step}px`; // Mueve la nave hacia arriba
        } else if (direction === "down" && top < caja.clientHeight - nave.offsetHeight) {
            nave.style.top = `${top + step}px`; // Mueve la nave hacia abajo
        }
    }

    function fire() {
        const bullet = document.createElement("div"); // Crea un nuevo elemento 'div' para representar la bala
        bullet.className = "bullet"; // Asigna la clase 'bullet' al elemento de la bala
        bullet.style.left = `${parseInt(window.getComputedStyle(nave).left) + nave.offsetWidth / 10 - 10}px`; // Posición inicial de la bala en el eje horizontal
        bullet.style.top = `${parseInt(window.getComputedStyle(nave).top) - 10}px`; // Posición inicial de la bala en el eje vertical
        caja.appendChild(bullet); // Agrega la bala al contenedor principal (caja)

        let bulletInterval = setInterval(() => {
            let top = parseInt(window.getComputedStyle(bullet).top); // Posición actual de la bala en el eje vertical
            bullet.style.top = `${top - 10}px`; // Mueve la bala hacia arriba

            // Remueve la bala si sale de la pantalla
            if (top < 0) {
                bullet.remove();
                clearInterval(bulletInterval);
            }

            // Verifica colisiones entre la bala y los enemigos
            enemigos.forEach((enemy, index) => {
                if (isCollision(bullet, enemy)) { // Si hay colisión entre la bala y un enemigo
                    createExplosion(parseInt(enemy.style.left), parseInt(enemy.style.top)); // Crea una explosión en la posición del enemigo
                    enemy.remove(); // Elimina al enemigo del DOM
                    enemigos.splice(index, 1); // Elimina al enemigo del array de enemigos
                    bullet.remove(); // Elimina la bala del DOM
                    clearInterval(bulletInterval); // Detiene el intervalo de la bala
                    updateScore(); // Actualiza la puntuación del juego
                }
            });

            // Verifica colisión entre la bala y el enemigo especial
            if (specialEnemy && isCollision(bullet, specialEnemy)) {
                createExplosion(parseInt(specialEnemy.style.left), parseInt(specialEnemy.style.top)); // Crea una explosión en la posición del enemigo especial
                specialEnemyLive--; // Reduce la vida del enemigo especial
                specialEnemy.classList.add('damage'); // Agrega una clase para indicar daño al enemigo especial
                setTimeout(() => specialEnemy.classList.remove('damage'), 200); // Quita la clase de daño después de un breve tiempo

                // Si el enemigo especial queda sin vida
                if (specialEnemyLive <= 0) {
                    createExplosion(parseInt(specialEnemy.style.left), parseInt(specialEnemy.style.top)); // Crea una explosión en la posición del enemigo especial
                    specialEnemy.remove(); // Elimina al enemigo especial del DOM
                    specialEnemy = null; // Reinicia la referencia al enemigo especial
                    displayMessage('HAS GANADO'); // Muestra un mensaje de victoria
                    restartGame(); // Reinicia el juego
                }

                bullet.remove(); // Elimina la bala del DOM
                clearInterval(bulletInterval); // Detiene el intervalo de la bala
                updateScore(); // Actualiza la puntuación del juego
            }
        }, 50); // Intervalo de tiempo para mover la bala (50 milisegundos)
    }

    function isCollision(bullet, target) {
        // Obtiene los rectángulos delimitadores de la bala y del objetivo
        let bulletRect = bullet.getBoundingClientRect();
        let targetRect = target.getBoundingClientRect();

        // Verifica si no hay colisión entre la bala y el objetivo
        return !(bulletRect.top > targetRect.bottom ||
            bulletRect.bottom < targetRect.top ||
            bulletRect.right < targetRect.left ||
            bulletRect.left > targetRect.right);
    }

    function createExplosion(x, y) {
        // Crea un elemento 'div' para representar una explosión
        const explosion = document.createElement("div");
        explosion.className = "explosion"; // Asigna la clase 'explosion' al elemento de la explosión
        explosion.style.left = `${x}px`; // Posición horizontal de la explosión
        explosion.style.top = `${y}px`; // Posición vertical de la explosión
        caja.appendChild(explosion); // Agrega la explosión al contenedor principal (caja)

        // Elimina la explosión después de 500 milisegundos
        setTimeout(() => explosion.remove(), 500);
    }


    let animate = () => {
        if (!juegoEnMarcha) return; // Si el juego no está en marcha, detiene la animación
        window.requestAnimationFrame(animate); // Solicita la próxima animación de fotograma
        tiempo++; // Incrementa el tiempo del juego

        // Cada cierto tiempo, genera un nuevo enemigo
        if (tiempo % 200 === 0) {
            let x = Math.random() * (caja.clientWidth - 50); // Posición horizontal aleatoria del nuevo enemigo
            let y = -50; // Posición inicial vertical fuera de la pantalla
            let n = document.createElement('div'); // Crea un nuevo elemento 'div' para el enemigo
            n.classList.add('enemigos'); // Asigna la clase 'enemigos' al elemento del enemigo
            n.style.left = `${x}px`; // Establece la posición horizontal del enemigo
            n.style.top = `${y}px`; // Establece la posición vertical del enemigo
            caja.appendChild(n); // Agrega el enemigo al contenedor principal (caja)
            enemigos.push(n); // Agrega el enemigo al array de enemigos
            enemyFire(n); // El enemigo dispara
        }

        // Itera sobre todos los enemigos en pantalla
        enemigos.forEach(enemy => {
            let top = parseInt(window.getComputedStyle(enemy).top); // Posición vertical actual del enemigo

            if (top < caja.clientHeight) {
                enemy.style.top = `${top + speed}px`; // Mueve el enemigo hacia abajo según la velocidad
                checkCollision(enemy); // Verifica colisiones del enemigo con la nave
            } else {
                enemy.remove(); // Elimina al enemigo del DOM si sale de la pantalla
                enemigos.splice(enemigos.indexOf(enemy), 1); // Elimina al enemigo del array de enemigos
            }
            enemyFire(enemy); // El enemigo dispara
        });

        // Movimiento del enemigo especial, si existe
        if (specialEnemy) {
            let left = parseInt(window.getComputedStyle(specialEnemy).left); // Posición horizontal actual del enemigo especial

            // Cambia la dirección del movimiento si el enemigo especial alcanza los bordes laterales de la caja
            if (left <= 0 || left >= caja.clientWidth - specialEnemy.offsetWidth) {
                specialEnemyDirection *= -1; // Invierte la dirección de movimiento
            }

            specialEnemy.style.left = `${left + specialEnemySpeed * specialEnemyDirection}px`; // Mueve al enemigo especial
        }
    };

    function enemyFire(enemy) {
        const enemyBullet = document.createElement("div"); // Crea un nuevo elemento 'div' para el proyectil del enemigo
        enemyBullet.className = "enemy-bullet"; // Asigna la clase 'enemy-bullet' al proyectil del enemigo
        enemyBullet.style.left = `${parseInt(window.getComputedStyle(enemy).left) + enemy.offsetWidth / 2 - 2.5}px`; // Posición horizontal inicial del proyectil
        enemyBullet.style.top = `${parseInt(window.getComputedStyle(enemy).top) + enemy.offsetHeight}px`; // Posición vertical inicial del proyectil
        caja.appendChild(enemyBullet); // Agrega el proyectil del enemigo al contenedor principal (caja)

        let enemyBulletInterval = setInterval(() => {
            let top = parseInt(window.getComputedStyle(enemyBullet).top); // Posición vertical actual del proyectil del enemigo
            enemyBullet.style.top = `${top + 10}px`; // Mueve el proyectil hacia abajo

            // Remueve el proyectil si sale de la pantalla o colisiona con la nave
            if (top > caja.clientHeight || isCollision(enemyBullet, nave)) {
                enemyBullet.remove(); // Elimina el proyectil del DOM
                clearInterval(enemyBulletInterval); // Detiene el intervalo de movimiento del proyectil

                // Si hay colisión con la nave, muestra el mensaje de Game Over y reinicia el juego
                if (isCollision(enemyBullet, nave)) {
                    createExplosion(parseInt(nave.style.left), parseInt(nave.style.top)); // Crea una explosión en la posición de la nave
                    alert("Game Over"); // Considera manejar esto de manera más elegante (como mostrar un mensaje o reiniciar automáticamente)
                    restartGame(); // Reinicia el juego
                }
            }

            // Verifica colisiones del proyectil con otros enemigos (opcional)
            enemigos.forEach((otherEnemy, index) => {
                if (otherEnemy !== enemy && isCollision(enemyBullet, otherEnemy)) {
                    createExplosion(parseInt(otherEnemy.style.left), parseInt(otherEnemy.style.top)); // Crea una explosión en la posición del otro enemigo
                    otherEnemy.remove(); // Elimina al otro enemigo del DOM
                    enemigos.splice(index, 1); // Elimina al otro enemigo del array de enemigos
                    enemyBullet.remove(); // Elimina el proyectil del enemigo del DOM
                    clearInterval(enemyBulletInterval); // Detiene el intervalo de movimiento del proyectil
                    updateScore(); // Actualiza la puntuación del juego
                }
            });
        }, 100); // Intervalo de tiempo para el movimiento del proyectil del enemigo (ajusta según sea necesario)
    }



    function checkCollision(enemy) {
        let naveRect = nave.getBoundingClientRect(); // Obtiene el rectángulo delimitador de la nave
        let enemyRect = enemy.getBoundingClientRect(); // Obtiene el rectángulo delimitador del enemigo

        // Verifica si hay colisión entre la nave y el enemigo
        if (naveRect.left < enemyRect.left + enemyRect.width &&
            naveRect.left + naveRect.width > enemyRect.left &&
            naveRect.top < enemyRect.top + enemyRect.height &&
            naveRect.top + naveRect.height > enemyRect.top) {
            alert("Game Over"); // Muestra un mensaje de Game Over
            restartGame(); // Reinicia el juego
        }
    }

    function toggleGamePause() {
        juegoEnMarcha = !juegoEnMarcha; // Cambia el estado del juego (en marcha o pausado)

        if (juegoEnMarcha) { // Si el juego está en marcha
            startTimer(); // Inicia el temporizador del juego
            enemigos.forEach(enemy => {
                enemy.style.animationPlayState = 'running'; // Reanuda la animación del enemigo
                resumeEnemyFire(enemy); // Reanuda el disparo del enemigo
            });
            if (specialEnemy) {
                specialEnemy.style.animationPlayState = 'running'; // Reanuda la animación del enemigo especial
            }
            displayMessage("Juego reanudado"); // Muestra un mensaje de que el juego se ha reanudado
        } else { // Si el juego está pausado
            clearInterval(gameInterval); // Limpia el intervalo del juego
            enemigos.forEach(enemy => {
                enemy.style.animationPlayState = 'paused'; // Pausa la animación del enemigo
                pauseEnemyFire(enemy); // Pausa el disparo del enemigo
            });
            if (specialEnemy) {
                specialEnemy.style.animationPlayState = 'paused'; // Pausa la animación del enemigo especial
            }
            displayMessage("Juego pausado"); // Muestra un mensaje de que el juego está pausado
        }
    }

    function resumeEnemyFire(enemy) {
        if (enemy.enemyBulletInterval) {
            clearInterval(enemy.enemyBulletInterval); // Limpia el intervalo de disparo del enemigo si existe
        }
        enemyFire(enemy); // Reanuda el disparo del enemigo
    }

    function pauseEnemyFire(enemy) {
        if (enemy.enemyBulletInterval) {
            clearInterval(enemy.enemyBulletInterval); // Limpia el intervalo de disparo del enemigo si existe
        }
    }

    function updateScore() {
        score += 10; // Incrementa la puntuación por cada actualización
        scoreElement.textContent = score; // Actualiza el elemento HTML que muestra la puntuación
    }

    function restartGame() {
        score = 0; // Reinicia la puntuación a cero
        scoreElement.textContent = score; // Actualiza el elemento HTML de la puntuación
        enemigos.forEach(enemy => enemy.remove()); // Elimina todos los enemigos del DOM
        enemigos = []; // Reinicia el array de enemigos
        bullets.forEach(bullet => {
            bullet.remove();
            enemyBullet.remove();
        });
        nave.style.left = '50%'; // Posiciona la nave en el centro horizontal de la caja
        nave.style.top = 'calc(80% - 50px)'; // Posiciona la nave cerca del borde inferior de la caja
        tiempo = 0; // Reinicia el tiempo del juego
        specialEnemyLive = initialSpecialEnemyLive; // Reinicia la vida del enemigo especial inicial
        if (specialEnemy) {
            specialEnemy.remove(); // Elimina al enemigo especial del DOM si existe
            specialEnemy = null; // Reinicia la referencia al enemigo especial
        }
        clearInterval(enemyBullet); // Limpia el intervalo de los proyectiles enemigos
        clearInterval(bulletInterval); // Limpia el intervalo de las balas
        enemyBullet.textContent = ""; // Limpia el contenido de los proyectiles enemigos
        clearInterval(gameInterval); // Limpia el intervalo del juego principal
        tiempoElement.textContent = ""; // Limpia el elemento que muestra el tiempo restante
        startTimer(); // Inicia el temporizador del juego
        juegoEnMarcha = true; // Marca que el juego está en marcha
        animate(); // Inicia la animación del juego
    }

    function startTimer() {
        let timeLeft = gameTime; // Inicializa el tiempo restante con el tiempo total de juego
        gameInterval = setInterval(() => {
            let minutes = Math.floor(timeLeft / 60); // Calcula los minutos restantes
            let seconds = timeLeft % 60; // Calcula los segundos restantes
            tiempoElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Actualiza el elemento HTML que muestra el tiempo restante

            timeLeft--; // Decrementa el tiempo restante

            if (timeLeft < 0) { // Si se acaba el tiempo
                clearInterval(gameInterval); // Detiene el intervalo del juego
                spawnSpecialEnemy(); // Genera un enemigo especial
            }
        }, 1000); // Intervalo de 1 segundo para actualizar el temporizador
    }

    function spawnSpecialEnemy() {
        if (!specialEnemy) { // Verifica si no hay un enemigo especial ya presente
            let x = Math.random() * (caja.clientWidth - 80); // Posición horizontal aleatoria del enemigo especial
            let y = -100; // Posición vertical inicial del enemigo especial fuera de la pantalla
            specialEnemy = document.createElement('div'); // Crea un nuevo elemento 'div' para el enemigo especial
            specialEnemy.classList.add('special-enemigo'); // Asigna la clase 'special-enemigo' al elemento del enemigo especial
            specialEnemy.style.left = `${x}px`; // Establece la posición horizontal del enemigo especial
            specialEnemy.style.top = `${y}px`; // Establece la posición vertical del enemigo especial
            caja.appendChild(specialEnemy); // Agrega el enemigo especial al contenedor principal (caja)
            specialEnemyLive = initialSpecialEnemyLive; // Establece la vida inicial del enemigo especial
            displayMessage("¡Nave especial en juego!"); // Muestra un mensaje indicando que el enemigo especial está en juego

            clearInterval(gameInterval); // Detiene el intervalo del juego principal
            tiempoElement.textContent = ""; // Limpia el elemento que muestra el tiempo restante
        }
    }

    function displayMessage(message) {
        const messageElement = document.createElement("div"); // Crea un nuevo elemento 'div' para mostrar el mensaje
        messageElement.textContent = message; // Asigna el texto del mensaje al elemento
        messageElement.classList.add("message"); // Asigna la clase 'message' al elemento
        messageElement.style.position = "fixed"; // Establece la posición fija para el mensaje
        messageElement.style.top = "50%"; // Posición vertical centrada del mensaje
        messageElement.style.left = "50%"; // Posición horizontal centrada del mensaje
        messageElement.style.transform = "translate(-50%, -50%)"; // Centra el mensaje en la pantalla
        messageElement.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // Fondo semitransparente negro para el mensaje
        messageElement.style.color = "#fff"; // Color de texto blanco para el mensaje
        messageElement.style.padding = "15px"; // Relleno del mensaje
        messageElement.style.borderRadius = "10px"; // Borde redondeado del mensaje
        messageElement.style.fontFamily = "Arial, sans-serif"; // Fuente del mensaje
        messageElement.style.fontSize = "24px"; // Tamaño de fuente del mensaje
        messageElement.style.textAlign = "center"; // Alineación centrada del texto del mensaje
        document.body.appendChild(messageElement); // Agrega el mensaje al cuerpo del documento

        setTimeout(() => messageElement.remove(), 3000); // Elimina el mensaje después de 3 segundos
    }

    startTimer(); // Inicia el temporizador del juego
    animate(); // Inicia la animación del juego
});
