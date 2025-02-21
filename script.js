class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.imageUpload = document.getElementById('image-upload');
        this.victoryMessage = document.getElementById('victory-message');
        this.scoreElement = document.getElementById('score-value');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.isLocked = false;
        
        this.defaultImages = [
            'images/image1.jpg', 'images/image2.jpg', 'images/image3.jpg', 'images/image4.jpg',
            'images/image5.jpg', 'images/image6.jpg', 'images/image7.jpg', 'images/image8.jpg'
        ];
        
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    async startNewGame(customImages = null) {
        this.resetGame();
        const images = customImages || this.defaultImages;
        const cardPairs = [...images, ...images];
        this.shuffleArray(cardPairs);
        this.createCards(cardPairs);
    }

    resetGame() {
        this.gameBoard.innerHTML = '';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.isLocked = false;
        this.victoryMessage.classList.add('hidden');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    createCards(images) {
        images.forEach((image, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="front">?</div>
                <div class="back">
                    <img src="${image}" alt="Card ${index + 1}">
                </div>
            `;
            card.addEventListener('click', () => this.flipCard(card, image));
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        });
    }

    flipCard(card, image) {
        if (this.isLocked || this.flippedCards.length >= 2 || card.classList.contains('flipped') || 
            this.cards.filter(c => c.classList.contains('matched')).includes(card)) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push({ card, image });

        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;
        const isMatch = first.image === second.image;

        if (isMatch) {
            this.handleMatch(first.card, second.card);
        } else {
            this.handleMismatch(first.card, second.card);
        }
    }

    handleMatch(firstCard, secondCard) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        this.matchedPairs++;
        this.score += 10;
        this.scoreElement.textContent = this.score;
        
        this.flippedCards = [];
        this.isLocked = false;

        if (this.matchedPairs === this.cards.length / 2) {
            this.showVictory();
        }
    }

    handleMismatch(firstCard, secondCard) {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            this.flippedCards = [];
            this.isLocked = false;
        }, 1000);
        
        this.score = Math.max(0, this.score - 1);
        this.scoreElement.textContent = this.score;
    }

    showVictory() {
        this.victoryMessage.classList.remove('hidden');
    }

    async handleImageUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length < 8) {
            alert('אנא בחר לפחות 8 תמונות');
            return;
        }

        const customImages = await Promise.all(
            files.slice(0, 8).map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
            })
        );

        this.startNewGame(customImages);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});