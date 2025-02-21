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

    // Default images for A-H with corresponding illustrations
    const defaultImages = [
        '/memory-game/images/image1.jpg',  // A with apple
        '/memory-game/images/image2.jpg', // B with butterfly
        '/memory-game/images/image3.jpg',    // C with car
        '/memory-game/images/image4.jpg',    // D with dog
        '/memory-game/images/image5.jpg', // E with elephant
        '/memory-game/images/image6.jpg',   // F with fish
        '/memory-game/images/image7.jpg', // G with giraffe
        '/memory-game/images/image8.jpg'   // H with house
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

        const gameImages = [...images, ...images]; // 16 cards (8 pairs)
        if (gameImages.length !== 16) {
            console.error('Expected 16 cards for a 4x4 grid');
            return;
        }
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
        if (files.length !== 8) {
            alert('אנא העלה בדיוק 8 תמונות עבור רשת 4x4');
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
