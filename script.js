class MemoryGame {
    constructor() {
        // Game elements
        this.gameBoard = document.getElementById('game-board');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.victoryMessage = document.getElementById('victory-message');
        this.scoreElement = document.getElementById('score-value');

        // Modals
        this.gameModeModal = document.getElementById('game-mode-modal');
        this.fileUploadModal = document.getElementById('file-upload-modal');
        this.helpModal = document.getElementById('help-modal');
        this.errorModal = document.getElementById('error-modal');
        this.errorMessage = document.getElementById('error-message');
        this.uploadInstructions = document.getElementById('upload-instructions');

        // Form elements
        this.gameModeForm = document.getElementById('game-mode-form');
        this.cancelModeBtn = document.getElementById('cancel-mode');
        this.imageUpload = document.getElementById('image-upload');
        this.uploadSubmitBtn = document.getElementById('upload-submit');
        this.cancelUploadBtn = document.getElementById('cancel-upload');
        this.closeHelpBtn = document.getElementById('close-help');
        this.closeErrorBtn = document.getElementById('close-error');

        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.isLocked = false;
        this.currentGameMode = 'identical'; // Default game mode

        this.defaultImages = [
            'images/1.jpg', 'images/2.jpg', 'images/3.jpg', 'images/4.jpg',
            'images/5.jpg', 'images/6.jpg', 'images/7.jpg', 'images/8.jpg'
        ];

        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Main controls
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.uploadBtn.addEventListener('click', () => this.showGameModeModal());
        this.helpBtn.addEventListener('click', () => this.showHelpModal());

        // Game mode modal
        this.gameModeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.gameModeForm);
            this.currentGameMode = formData.get('game-mode');
            this.hideGameModeModal();
            this.updateUploadInstructions();
            this.showFileUploadModal();
        });
        this.cancelModeBtn.addEventListener('click', () => this.hideGameModeModal());

        // File upload modal
        this.uploadSubmitBtn.addEventListener('click', () => this.handleImageUpload());
        this.cancelUploadBtn.addEventListener('click', () => this.hideFileUploadModal());

        // Help modal
        this.closeHelpBtn.addEventListener('click', () => this.hideHelpModal());

        // Error modal
        this.closeErrorBtn.addEventListener('click', () => this.hideErrorModal());
    }

    // Game initialization and reset
    async startNewGame(customContent = null) {
        this.resetGame();

        if (customContent) {
            this.createCustomGame(customContent);
        } else {
            // Default game with identical image pairs
            const cardPairs = [...this.defaultImages, ...this.defaultImages];
            this.shuffleArray(cardPairs);
            this.createCards(cardPairs, 'identical');
        }
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

    createCustomGame(content) {
        const cardPairs = [];

        if (this.currentGameMode === 'identical') {
            // Double the images for matching pairs
            content.forEach(item => {
                cardPairs.push({ type: 'image', content: item });
                cardPairs.push({ type: 'image', content: item });
            });
        } else if (this.currentGameMode === 'different') {
            // Images are already paired by name (file1 and file2)
            content.forEach(item => {
                cardPairs.push({ type: 'image', content: item });
            });
        } else if (this.currentGameMode === 'text') {
            // Create image-text pairs
            content.forEach(item => {
                cardPairs.push({ type: 'image', content: item.url, match: item.name });
                cardPairs.push({ type: 'text', content: item.name, match: item.url });
            });
        }

        this.shuffleArray(cardPairs);
        this.createCards(cardPairs, this.currentGameMode);
    }

    // Card creation and gameplay
    createCards(items, mode) {
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card';

            if (mode === 'identical' || mode === 'different') {
                if (typeof item === 'string') {
                    // For backward compatibility with default game
                    card.innerHTML = `
                        <div class="front">?</div>
                        <div class="back">
                            <img src="${item}" alt="Card ${index + 1}">
                        </div>
                    `;
                    card.dataset.image = item;
                } else {
                    card.innerHTML = `
                        <div class="front">?</div>
                        <div class="back">
                            <img src="${item.content}" alt="Card ${index + 1}">
                        </div>
                    `;
                    card.dataset.image = item.content;
                    if (item.match) card.dataset.match = item.match;
                }
            } else if (mode === 'text') {
                if (item.type === 'image') {
                    card.innerHTML = `
                        <div class="front">?</div>
                        <div class="back">
                            <img src="${item.content}" alt="Card ${index + 1}">
                        </div>
                    `;
                    card.dataset.image = item.content;
                } else {
                    card.classList.add('text-card');
                    card.innerHTML = `
                        <div class="front">?</div>
                        <div class="back">${item.content}</div>
                    `;
                    card.dataset.text = item.content;
                }
                card.dataset.match = item.match;
            }

            card.addEventListener('click', () => this.flipCard(card));
            this.gameBoard.appendChild(card);
            this.cards.push(card);
        });
    }

    flipCard(card) {
        if (this.isLocked ||
            this.flippedCards.length >= 2 ||
            card.classList.contains('flipped') ||
            card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flippedCards;
        let isMatch = false;

        if (this.currentGameMode === 'identical') {
            // Match identical images
            isMatch = first.dataset.image === second.dataset.image;
        } else if (this.currentGameMode === 'different' || this.currentGameMode === 'text') {
            // Match by match property or by comparing image to text
            if (first.dataset.match && second.dataset.match) {
                isMatch = (first.dataset.image && first.dataset.image === second.dataset.match) ||
                          (second.dataset.image && second.dataset.image === first.dataset.match) ||
                          (first.dataset.text && first.dataset.text === second.dataset.match) ||
                          (second.dataset.text && second.dataset.text === first.dataset.match);
            }
        }

        if (isMatch) {
            this.handleMatch(first, second);
        } else {
            this.handleMismatch(first, second);
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

    // File handling
    async handleImageUpload() {
        const files = Array.from(this.imageUpload.files);

        // Validate number of files
        if (this.currentGameMode === 'identical' || this.currentGameMode === 'text') {
            if (files.length < 8) {
                this.showError('אנא בחר לפחות 8 תמונות');
                return;
            }
        } else if (this.currentGameMode === 'different') {
            if (files.length < 16) {
                this.showError('אנא בחר לפחות 16 תמונות');
                return;
            }
        }

        if (this.currentGameMode === 'different') {
            // Validate file pairs format
            const fileBasenames = files.map(file => this.getBaseName(file.name));
            const uniqueBasenames = new Set();

            // Check if each file has a pair with suffix 1 and 2
            const errors = [];
            const pairMap = {};

            files.forEach(file => {
                const fullName = file.name;
                if (!(fullName.endsWith('1.jpg') || fullName.endsWith('1.jpeg') ||
                      fullName.endsWith('1.png') || fullName.endsWith('2.jpg') ||
                      fullName.endsWith('2.jpeg') || fullName.endsWith('2.png'))) {
                    errors.push(`הקובץ ${fullName} אינו מסתיים ב-1 או 2`);
                    return;
                }

                const suffix = fullName.slice(-5, -4); // Get the '1' or '2'
                const baseName = fullName.slice(0, -5); // Remove the suffix and extension

                if (!pairMap[baseName]) {
                    pairMap[baseName] = [];
                }

                pairMap[baseName].push({
                    file: file,
                    suffix: suffix
                });

                uniqueBasenames.add(baseName);
            });

            // Check if each base name has exactly two files (with suffixes 1 and 2)
            for (const baseName of uniqueBasenames) {
                const pair = pairMap[baseName];
                if (!pair || pair.length !== 2) {
                    errors.push(`אין זוג מתאים עבור ${baseName}`);
                    continue;
                }

                const suffixes = pair.map(p => p.suffix).sort().join('');
                if (suffixes !== '12') {
                    errors.push(`הקבצים של ${baseName} אינם מסתיימים ב-1 ו-2`);
                }
            }

            if (errors.length > 0) {
                this.showError(errors.join('<br>'));
                return;
            }

            // Process the files for different mode
            const customImages = await Promise.all(
                files.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const baseName = this.getBaseName(file.name);
                            resolve({
                                content: e.target.result,
                                match: baseName
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                })
            );

            this.hideFileUploadModal();
            this.startNewGame(customImages);

        } else if (this.currentGameMode === 'text') {
            // Process files for text mode
            const customImages = await Promise.all(
                files.slice(0, 8).map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const fileName = this.getBaseNameWithoutExtension(file.name);
                            resolve({
                                url: e.target.result,
                                name: fileName
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                })
            );

            this.hideFileUploadModal();
            this.startNewGame(customImages);

        } else {
            // Process files for identical mode
            const customImages = await Promise.all(
                files.slice(0, 8).map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });
                })
            );

            this.hideFileUploadModal();
            this.startNewGame(customImages);
        }
    }

    // Helper methods
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    getBaseName(fileName) {
        // Remove the suffix (1 or 2) for the 'different' mode
        // For example: "zebra1.jpg" -> "zebra"
        const name = fileName.split('.');
        const ext = name.pop();
        const base = name.join('.');
        return base.slice(0, -1);  // Remove the last character (1 or 2)
    }

    getBaseNameWithoutExtension(fileName) {
        // Get file name without extension for 'text' mode
        return fileName.split('.')[0];
    }

    updateUploadInstructions() {
        if (this.currentGameMode === 'identical') {
            this.uploadInstructions.textContent = 'בחר 8 תמונות להעלאה';
        } else if (this.currentGameMode === 'different') {
            this.uploadInstructions.textContent = 'בחר 16 תמונות להעלאה (עם סיומות 1 ו-2)';
        } else if (this.currentGameMode === 'text') {
            this.uploadInstructions.textContent = 'בחר 8 תמונות להעלאה (שם הקובץ יהיה הטקסט המותאם)';
        }
    }

    // Modal controls
    showGameModeModal() {
        this.gameModeModal.classList.remove('hidden');
    }

    hideGameModeModal() {
        this.gameModeModal.classList.add('hidden');
    }

    showFileUploadModal() {
        this.fileUploadModal.classList.remove('hidden');
    }

    hideFileUploadModal() {
        this.fileUploadModal.classList.add('hidden');
        this.imageUpload.value = ''; // Clear the file input
    }

    showHelpModal() {
        this.helpModal.classList.remove('hidden');
    }

    hideHelpModal() {
        this.helpModal.classList.add('hidden');
    }

    showError(message) {
        this.errorMessage.innerHTML = message;
        this.errorModal.classList.remove('hidden');
    }

    hideErrorModal() {
        this.errorModal.classList.add('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});