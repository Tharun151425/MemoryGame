const shuffle = (arr) => {
    for (let i = 0; i <arr.length - 1; i++){
        let j = Math.floor(Math.random() * (arr.length - 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
const TIME = 60;
const Timer = document.getElementById('timer');
const Score = document.getElementById('score');
const Start = document.getElementById('start');
const GameContainer = document.getElementById('gamecontainer');
const colors = ['red', 'blue', 'green', 'purple', 'orange', 'pink', 'red', 'blue', 'green', 'purple', 'orange', 'pink'];
const High = document.getElementById('high');
let cards = shuffle(colors.concat(colors));
// console.log(colors, typeof colors);
// console.log(cards, typeof cards);
let score = 0;
let timeLeft = TIME;
let gameInterval;
let selected = [];
let highscore = 0;

function startGameTimer(timeLeft){
    Timer.textContent = `Time Left : ${timeLeft}`;
    gameInterval = setInterval(
        ()=> {
            timeLeft--;
            Timer.textContent = `Time Left : ${timeLeft}`;
            if (timeLeft == 0){
                clearInterval(gameInterval);
                timeLeft = TIME;
                if (score > highscore){
                    highscore = score;
                    High.textContent= `Highest Score : ${highscore}`;
                }
                alert(`Game Over! Your Score ${score}`);
                generateCards();
                Timer.textContent = `Time Left : ${timeLeft}`;
                Start.disabled = false;
        }
    },1000)
}


function generateCards(){
    GameContainer.innerHTML = '';
    let c = 0;
    for (const color of cards){
        let newCard = document.createElement('div');
        newCard.classList.add('card');
        newCard.dataset.color = color;
        newCard.dataset.id = c++;
        newCard.textContent = '?';
        GameContainer.appendChild(newCard); 
    }
}
function checkMatch(){
    let [card1, card2] = selected;
    if ((card1.dataset.color === card2.dataset.color) && (card1.dataset.id != card2.dataset.id)){
        card1.classList.add('matched');
        card2.classList.add('matched');
        score += 2;
        if (score === 24){
            clearInterval(gameInterval);
            timeLeft = TIME;
            if (score > highscore){
                highscore = score;
                High.textContent= `Highest Score : ${highscore}`;
            }
            alert(`Congrats! You have completed🥳🥳🥳!!!! Your Score ${score}`);
            generateCards();
            Timer.textContent = `Time Left : ${timeLeft}`;
            Start.disabled = false;
        }
        Score.textContent = `Score: ${score}`;
    }
    else {
        card1.textContent = '?';
        card2.textContent = '?';
        card1.style.backgroundColor = '#ddd';
        card2.style.backgroundColor = '#ddd';
    }
    selected = [];
}
function Exit(){
    clearInterval(gameInterval);
    timeLeft = TIME;
    if (score > highscore){
        highscore = score;
        High.textContent= `Highest Score : ${highscore}`;
    }
    alert(`Better Luck Next Time! Your Score ${score}`);
    generateCards();
    Timer.textContent = `Time Left : ${timeLeft}`;
    Start.disabled = false;
}

function CardClick(event){
    const card = event.target;
    if (!card.classList.contains('card') || card.classList.contains('matched'))
        return;
    card.textContent = card.dataset.color;
    card.style.backgroundColor = card.dataset.color;
    selected.push(card);
    if (selected.length === 2){
        setTimeout(checkMatch,500);
    }
}
function startGame() {
    timeLeft = TIME;
    Start.disabled = true;
    score = 0;
    Score.textContent =`Score : ${score}`;
    startGameTimer(timeLeft);
    cards = shuffle(colors.concat(colors));
    selected = [];
    generateCards();
    GameContainer.addEventListener('click',CardClick);
}