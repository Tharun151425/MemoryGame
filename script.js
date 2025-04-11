const TIME = 60;
const COLORS = [
    '#fd79a8', '#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#00b894',
    '#e84393', '#74b9ff', '#55efc4', '#fab1a0', '#0984e3', '#ff7675'
];

const timer = document.getElementById('timer');
const score = document.getElementById('score');
const highScore = document.getElementById('high');
const startBtn = document.getElementById('start');
const exitBtn = document.getElementById('exit');
const gameContainer = document.getElementById('gamecontainer');
const themeSwitch = document.getElementById('theme-switch');
const scoreboardContainer = document.getElementById('scoreboard');
const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalExit = document.getElementById('modal-exit');
const modalClose = document.getElementById('modal-close');
const clearScoresBtn = document.getElementById('clear-scores');
const difficultySelect = document.getElementById('difficulty');
const difficultyLevelDisplay = document.getElementById('difficulty-level-display');
const highDifficultyDisplay = document.getElementById('high-difficulty');
let highestDifficulty = localStorage.getItem('highestDifficulty') || 'Explorer'; // Default to 'Explorer'

function saveHighestDifficulty(difficulty) {
    localStorage.setItem('highestDifficulty', difficulty);
    highestDifficulty = difficulty;
    highDifficultyDisplay.textContent = `Highest Difficulty: ${highestDifficulty}`; // Update UI
}

difficultySelect.addEventListener('change', function () {
    const selectedDifficulty = difficultySelect.value;
    
    // Save and update highest difficulty if the selected one is higher
    if (selectedDifficulty > highestDifficulty) {
        saveHighestDifficulty(selectedDifficulty);
    }
});


clearScoresBtn.addEventListener('click', ()=>
    {
        localStorage.removeItem('scores');
        localStorage.removeItem('highScore');
        previousScores = [];
        highestScore = 0;
        highScore.textContent = `High Score: 0`;
        updateScoreboardDisplay();
    }
);

modalExit.addEventListener('click', () => {
    modal.style.display = 'none';
    resetGameState();
});

let cards = [];
let selectedCards = [];
let currentScore = 0;
let timeLeft = TIME;
let gameInterval;
let highestScore = localStorage.getItem('highScore') || 0;
let isPlaying = false;
let previousScores = JSON.parse(localStorage.getItem('scores')) || [];

function init() {
    highScore.textContent = `High Score: ${highestScore}`;
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Initialize Difficulty from localStorage
    difficultySelect.value = localStorage.getItem('selectedDifficulty') || 'explorer';
    difficultyLevelDisplay.textContent = `Difficulty: ${difficultySelect.value}`; // Display difficulty
    
    updateScoreboardDisplay();
    
    generateCards();

    startBtn.addEventListener('click', startGame);
    exitBtn.addEventListener('click', exitGame);
    themeSwitch.addEventListener('click', toggleTheme);
    gameContainer.addEventListener('click', handleCardClick);
    modalClose.addEventListener('click', closeModal);
    
    exitBtn.disabled = true;
}


function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeSwitch.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeSwitch.setAttribute('aria-label', 'Toggle light mode');
    } else {
        icon.className = 'fas fa-moon';
        themeSwitch.setAttribute('aria-label', 'Toggle dark mode');
    }
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function generateCards() {
    gameContainer.innerHTML = '';
    
    const cardColors = shuffle([...COLORS, ...COLORS]);
    cards = cardColors;
    
    for (let i = 0; i < cards.length; i++) {
        const color = cards[i];
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.color = color;
        card.dataset.index = i;
        card.textContent = '?';
        gameContainer.appendChild(card);
    }
}

function startGame() {
    if (isPlaying) return;
    
    isPlaying = true;
    timeLeft = TIME;
    currentScore = 0;
    selectedCards = [];
    
    score.textContent = `Score: ${currentScore}`;
    timer.textContent = `Time: ${timeLeft}s`;
    startBtn.disabled = true;
    exitBtn.disabled = false;
    
    // Save selected difficulty to localStorage when game starts
    const selectedDifficulty = difficultySelect.value;
    localStorage.setItem('selectedDifficulty', selectedDifficulty);

    generateCards();
    startGameTimer();
}

function exitGame() {
    if (!isPlaying) return;

    clearInterval(gameInterval);
    
    const selectedDifficulty = difficultySelect.value;  // Get current difficulty
    
    if (timeLeft < 60) {
        if (currentScore > highestScore) {
            highestScore = currentScore;
            localStorage.setItem('highScore', highestScore);
            highScore.textContent = `High Score: ${highestScore}`;
        }
        
        // Check if selected difficulty is higher than the saved one and update
        if (selectedDifficulty > highestDifficulty) {
            saveHighestDifficulty(selectedDifficulty);
        }
        
        console.log(localStorage);
        saveScore(currentScore, false);
        
        showModal('Game Exited', `Your score: ${currentScore}`);
        
        resetGameState();
    }
}


function startGameTimer() {
    timer.textContent = `Time: ${timeLeft}s`;
    
    gameInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = `Time: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            
            if (currentScore > highestScore) {
                highestScore = currentScore;
                localStorage.setItem('highScore', highestScore);
                highScore.textContent = `High Score: ${highestScore}`;
            }
            
            saveScore(currentScore, false);
            showModal('Time\'s Up!', `Your score: ${currentScore}`);
            resetGameState();
        }
    }, 1000);
}

function resetGameState() {
    isPlaying = false;
    startBtn.disabled = false;
    exitBtn.disabled = true;
}

function handleCardClick(event) {
    if (!isPlaying) return;
    
    const card = event.target;
    
    if (!card.classList.contains('card')) return;
    
    if (card.classList.contains('matched') || selectedCards.includes(card)) return;
    revealCard(card);
    selectedCards.push(card);
    
    if (selectedCards.length === 2) {
        checkForMatch();
    }
}

function revealCard(card) {
    card.style.backgroundColor = card.dataset.color;
    card.textContent = '';
}

function checkForMatch() {
    const [card1, card2] = selectedCards;
    
    isPlaying = false;
    
    setTimeout(() => {
        if (card1.dataset.color === card2.dataset.color && card1.dataset.index !== card2.dataset.index) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            currentScore += 2;
            score.textContent = `Score: ${currentScore}`;
            
            const matchedCards = document.querySelectorAll('.matched');
            if (matchedCards.length === cards.length) {
                clearInterval(gameInterval);
                
                if (currentScore > highestScore) {
                    highestScore = currentScore;
                    localStorage.setItem('highScore', highestScore);
                    highScore.textContent = `High Score: ${highestScore}`;
                }
                
                saveScore(currentScore, true);
                
                showModal('Congratulations!', `You completed the game with a score of ${currentScore}!`);
                
                resetGameState();
                return;
            }
        } else {
            card1.style.backgroundColor = '';
            card2.style.backgroundColor = '';
            card1.textContent = '?';
            card2.textContent = '?';
        }
        
        selectedCards = [];
        
        isPlaying = true;
    }, 600);
}

function saveScore(scoreValue, completed) {
    const scoreEntry = {
        score: scoreValue,
        date: new Date().toISOString(),
        completed: completed
    };
    
    previousScores.unshift(scoreEntry);
    
    if (previousScores.length > 10) {
        previousScores = previousScores.slice(0, 10);
    }
    
    localStorage.setItem('scores', JSON.stringify(previousScores));

    updateScoreboardDisplay();
}

function updateScoreboardDisplay() {
    scoreboardContainer.innerHTML = '';
    
    if (previousScores.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-scores');
        emptyMessage.textContent = 'No games played yet';
        scoreboardContainer.appendChild(emptyMessage);
        return;
    }
    
    previousScores.forEach(scoreEntry => {
        const scoreItem = document.createElement('div');
        scoreItem.classList.add('score-item');
        
        const scoreValue = document.createElement('span');
        scoreValue.classList.add('score-value');
        scoreValue.textContent = `${scoreEntry.score} points`;
        
        if (scoreEntry.completed) {
            const completionIcon = document.createElement('i');
            completionIcon.classList.add('fas', 'fa-check-circle');
            completionIcon.style.color = 'green';
            completionIcon.style.marginLeft = '5px';
            scoreValue.appendChild(completionIcon);
        }
        
        const scoreDate = document.createElement('span');
        scoreDate.classList.add('score-date');
        
        // Format date in a shorter, more readable format
        const date = new Date(scoreEntry.date);
        const today = new Date();
        
        // If today, just show time
        if (date.toDateString() === today.toDateString()) {
            scoreDate.textContent = `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        } 
        // If this year, show month and day
        else if (date.getFullYear() === today.getFullYear()) {
            scoreDate.textContent = date.toLocaleDateString([], {month: 'short', day: 'numeric'});
        } 
        // Otherwise show full date
        else {
            scoreDate.textContent = date.toLocaleDateString([], {month: 'short', day: 'numeric', year: '2-digit'});
        }
        
        scoreItem.appendChild(scoreValue);
        scoreItem.appendChild(scoreDate);
        scoreboardContainer.appendChild(scoreItem);
    });
}

function showModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    
    if (!isPlaying) {
        startGame();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);