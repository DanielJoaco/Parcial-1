//Al refrescar la página, se ejecuta la función refreshPage
document.addEventListener("DOMContentLoaded", refreshPage);

//Función para crear una promesa que se resuelve después de un tiempo determinado
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//Obtenemos referencias a los elementos del DOM que utilizaremos en el juego
let button_start = document.getElementById("start-button");
let game_container = document.getElementById("game-container");
let target = document.getElementById("target");
let message = document.getElementById("message");
let p_score = document.getElementById("score");
//Inicializamos la puntuación y el array de índices de los botones
let score = 0;
let index_buttons = [];

//Agregamos un evento al botón de inicio para comenzar el juego
button_start.addEventListener("click", startGame);


//Función para refrescar la página, mostrando el botón de inicio y ocultando el contenedor del juego
function refreshPage(){
    button_start.style.display = "block";
    game_container.style.display = "none";
}


//Función para iniciar el juego, reiniciando la puntuación, mostrando los botones y comenzando la cuenta regresiva
function startGame(){
    //Reiniciamos la puntuación y el array de índices de los botones
    score = 0;
    index_buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    p_score.style.display = "block";
    target.style.display = "grid";
    //Mostramos los botones y los habilitamos para el juego
    for (let i = 0; i < index_buttons.length; i++) {
        let button = document.getElementById(`target-button_${index_buttons[i]}`);
        if (button) {
            button.classList.remove("button-hit");
            button.style.visibility = "visible";
            button.textContent = "";
            button.disabled = true;
        }
    }
    //Actualizamos la puntuación y ocultamos el botón de inicio para mostrar el contenedor del juego
    p_score.textContent = "Puntuación: " + score;
    button_start.style.display = "none";
    game_container.style.display = "flex";
    //Iniciamos la cuenta regresiva antes de comenzar el juego
    let sec = 5;
    showBeginningMessage(sec);
    

}

async function showBeginningMessage(sec){
    //Mostramos un mensaje de preparación con la cuenta regresiva
    message.textContent = "Preparate: " + sec + " segundos...";
    if(sec > 0){
        await delay(1000);
        showBeginningMessage(sec - 1);
    } else{
        message.textContent = "¡Comienza!";
        await delay(100);
        gameLogic();
    }    
}

async function gameLogic(){
    //Seleccionamos un botón aleatorio de los disponibles y le asignamos un evento para aumentar la puntuación al hacer clic
    let random_index = Math.floor(Math.random() * index_buttons.length + 1);
    let button = document.getElementById("target-button_" + index_buttons[random_index - 1]);
    button.disabled = false;
    button.textContent = "X";
    button.addEventListener("click", () => {
        score++;
        button.classList.add("button-hit");
        p_score.textContent = "Puntuación: " + score;
        button.disabled = true;
    }, { once: true });
    await delay(2000);
    button.disabled = true;
    button.style.visibility = "hidden";
    index_buttons.splice(random_index - 1, 1);
    if(index_buttons.length > 0){
        gameLogic();
    } else{
        p_score.style.display = "none";
        target.style.display = "none";
        message.innerHTML = "¡Juego terminado! <br>Puntuación final: " + score;
        await delay(5000);
        refreshPage();
    }
}