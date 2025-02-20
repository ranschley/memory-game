document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const uploadImages = document.getElementById('upload-images');
    const scoreDisplay = document.getElementById('score');
    const victoryMessage = document.getElementById('victory-message');
    const finalScore = document.getElementById('final-score');

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;

    const defaultImages = [
        'images/image1.jpg', 'images/image2.jpg', 'images/image3.jpg', 'images/image4.jpg',
        'images/image5.jpg', 'images/image6.jpg', 'images/image7.jpg', 'images/image8.jpg'
    ];

    function createCard(image) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="front">מיתרים ונהנים</div>
            <div class="back"><img src="${image}" alt="card image"></div>
        `;
        card.addEventListener('click', () => flipCard(card));
        return card;
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startGame(images = defaultImages) {
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        score = 0;
        scoreDisplay.textContent = `ניקוד: ${score}`;
        victoryMessage.classList.add('hidden');

        const gameImages = [...images, ...images]; // Duplicate for pairs
        shuffle(gameImages);

        gameImages.forEach(image => {
            const card = createCard(image);
            cards.push({ element: card, image });
            gameBoard.appendChild(card);
        });
    }

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                checkMatch();
            }
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const img1 = card1.querySelector('img').src;
        const img2 = card2.querySelector('img').src;

        if (img1 === img2) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            score += 10;
            scoreDisplay.textContent = `ניקוד: ${score}`;
            flippedCards = [];

            if (matchedPairs === 8) {
                victoryMessage.classList.remove('hidden');
                finalScore.textContent = score;
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                score = Math.max(0, score - 2); // Deduct points for mismatch
                scoreDisplay.textContent = `ניקוד: ${score}`;
            }, 1000);
        }
    }

    newGameBtn.addEventListener('click', () => startGame());

    uploadImages.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 8) {
            alert('אנא העלה עד 8 תמונות בלבד');
            return;
        }
        const readerPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(readerPromises).then(images => {
            startGame(images);
        });
    });

    // Start the game with default images
    startGame();
});
