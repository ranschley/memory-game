class MemoryGame {
    constructor() {
        // Game elements
        this.gameBoard = document.getElementById('game-board');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.uploadBtn = document.getElementById('upload-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.scoreElement = document.getElementById('score-value');
        this.victoryMessage = document.getElementById('victory-message');

        // Modal elements
        this.modeModal = document.getElementById('mode-modal');
        this.helpModal = document.getElementById('help-modal');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.imageUpload = document.getElementById('image-upload');
        this.startGameBtn = document.getElementById('start-game-btn');
        this.modeInstructions = document.getElementById('mode-instructions');
        this.errorMessage = document.getElementById('error-message');
        this.fileNameDisplay = document.getElementById('file-name-display');
        this.modeRadios = document.querySelectorAll('input[name="game-mode"]');

        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.isLocked = false;
        this.gameMode = 'identical'; // Default mode
        this.customImages = [];

        // Default images
        this.defaultImages = [
            'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg',
            'img/5.jpg', 'img/6.jpg', 'img/7.jpg', 'img/8.jpg'
        ];

        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // Game control buttons
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.uploadBtn.addEventListener('click', () => this.openModeModal());
        this.helpBtn.addEventListener('click', () => this.openHelpModal());

        // Modal control
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Mode selection and file upload
        this.modeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateModeInstructions());
        });

        this.imageUpload.addEventListener('change', (e) => this.handleFileSelection(e));
        this.startGameBtn.addEventListener('click', () => this.validateAndStartGame());

        // Close modals if clicked outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modeModal) {
                this.closeAllModals();
            }
            if (e.target === this.helpModal) {
                this.closeAllModals();
            }
        });
    }

    openModeModal() {
        this.modeModal.classList.remove('hidden');
        this.updateModeInstructions();
        this.resetModalInputs();
    }

    openHelpModal() {
        this.helpModal.classList.remove('hidden');
    }

    closeAllModals() {
        this.modeModal.classList.add('hidden');
        this.helpModal.classList.add('hidden');
    }

    resetModalInputs() {
        this.imageUpload.value = '';
        this.fileNameDisplay.textContent = 'לא נבחרו קבצים';
        this.errorMessage.classList.add('hidden');
        this.errorMessage.textContent = '';
        this.customImages = [];
    }

    updateModeInstructions() {
        const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
        this.gameMode = selectedMode;

        switch (selectedMode) {
            case 'identical':
                this.modeInstructions.textContent = 'יש להעלות 8 תמונות';
                break;
            case 'different':
                this.modeInstructions.textContent = 'יש להעלות 16 תמונות, עם הסיומות \'1\' ו\'2\'';
                break;
            case 'text':
                this.modeInstructions.textContent = 'יש להעלות 8 תמונות, שם הקובץ ישמש כטקסט לכרטיס המתאים';
                break;
        }
    }

    handleFileSelection(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
            this.fileNameDisplay.textContent = 'לא נבחרו קבצים';
            return;
        }

        this.fileNameDisplay.textContent = `נבחרו ${files.length} קבצים`;
        this.errorMessage.classList.add('hidden');
    }

    async validateAndStartGame() {
        const files = Array.from(this.imageUpload.files);
        if (files.length === 0) {
            this.showError('יש לבחור תמונות');
            return;
        }

        // Validate based on game mode
        switch (this.gameMode) {
            case 'identical':
                if (files.length !== 8) {
                    this.showError('יש להעלות בדיוק 8 תמונות למצב זה');
                    return;
                }
                break;

            case 'different':
                if (files.length !== 16) {
                    this.showError('יש להעלות בדיוק 16 תמונות למצב זה');
                    return;
                }

                // Verify naming convention
                const baseNames = new Set();
                const pairMap = {};

                for (const file of files) {
                    const filename = file.name.split('.')[0]; // Remove extension
                    if (!filename.endsWith('1') && !filename.endsWith('2')) {
                        this.showError('שמות התמונות חייבים להסתיים ב-\'1\' או \'2\', לדוגמה: \'זברה1.jpg\' ו-\'זברה2.jpg\'');
                        return;
                    }

                    const baseName = filename.slice(0, -1); // Remove the last character (1 or 2)
                    baseNames.add(baseName);

                    if (!pairMap[baseName]) {
                        pairMap[baseName] = [];
                    }
                    pairMap[baseName].push(file);
                }

                // Check if we have exactly 8 pairs
                if (baseNames.size !== 8) {
                    this.showError('יש להעלות בדיוק 8 זוגות של תמונות (16 תמונות בסך הכל)');
                    return;
                }

                // Check if each base name has exactly 2 files
                for (const baseName of baseNames) {
                    if (pairMap[baseName].length !== 2) {
                        this.showError(`לא נמצאו 2 תמונות לבסיס השם '${baseName}'`);
                        return;
                    }

                    // Check if we have both '1' and '2' suffixes
                    const suffixes = pairMap[baseName].map(file => file.name.split('.')[0].slice(-1));
                    if (!suffixes.includes('1') || !suffixes.includes('2')) {
                        this.showError(`לבסיס השם '${baseName}' חסרה תמונה עם סיומת '1' או '2'`);
                        return;
                    }
                }
                break;

            case 'text':
                if (files.length !== 8) {
                    this.showError('יש להעלות בדיוק 8 תמונות למצב זה');
                    return;
                }
                break;
        }

        // Process images
        this.customImages = await this.processFiles(files);
        this.closeAllModals();
        this.startNewGameWithMode();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
    }

    async processFiles(files) {
        const processedFiles = [];

        // Process each file to get URL and name
        for (const file of files) {
            const imageUrl = await this.readFileAsDataURL(file);
            processedFiles.push({
                url: imageUrl,
                name: file.name
            });
        }

        return processedFiles;
    }

    readFileAsDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    startNewGame() {
        this.resetGame();
        const defaultImageUrls = this.defaultImages;
        const duplicatedImages = [...defaultImageUrls, ...defaultImageUrls];
        this.shuffleArray(duplicatedImages);
        this.createCards(duplicatedImages, 'identical');
    }

    startNewGameWithMode() {
        this.resetGame();

        switch (this.gameMode) {
            case 'identical':
                this.createIdenticalCards(this.customImages);
                break;

            case 'different':
                this.createDifferentCards(this.customImages);
                break;

            case 'text':
                this.createTextCards(this.customImages);
                break;
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

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createCards(images, mode = 'identical') {
        images.forEach((image, index) => {
            const card = document.createElement('div');
            card.className = 'card';

            const front = document.createElement('div');
            front.className = 'front';
            front.textContent = 'מיתרים ונהנים';

            const back = document.createElement('div');
            back.className = 'back';

            // For default mode or when providing direct image URLs
            if (typeof image === 'string') {
                const img = document.createElement('img');
                img.src = image;
                img.alt = `Card ${index + 1}`;
                back.appendChild(img);

                card.dataset.pairId = images.indexOf(image) % (images.length / 2);
            }

            card.appendChild(front);
            card.appendChild(back);
            this.gameBoard.appendChild(card);

            card.addEventListener('click', () => this.flipCard(card));
            this.cards.push(card);
        });
    }

    createIdenticalCards(images) {
        // Duplicate images for pairs
        const cardData = [];
        images.forEach((image, index) => {
            cardData.push({
                type: 'image',
                content: image.url,
                pairId: index
            });
            cardData.push({
                type: 'image',
                content: image.url,
                pairId: index
            });
        });

        this.shuffleArray(cardData);
        this.createCustomCards(cardData);
    }

    createDifferentCards(images) {
        // Group images by base name
        const pairs = {};

        images.forEach(image => {
            const filename = image.name.split('.')[0];
            const baseName = filename.slice(0, -1);
            const suffix = filename.slice(-1);

            if (!pairs[baseName]) {
                pairs[baseName] = {};
            }

            pairs[baseName][suffix] = image;
        });

        // Create card data with pair IDs
        const cardData = [];
        let pairId = 0;

        for (const baseName in pairs) {
            cardData.push({
                type: 'image',
                content: pairs[baseName]['1'].url,
                pairId: pairId
            });

            cardData.push({
                type: 'image',
                content: pairs[baseName]['2'].url,
                pairId: pairId
            });

            pairId++;
        }

        this.shuffleArray(cardData);
        this.createCustomCards(cardData);
    }

    createTextCards(images) {
        const cardData = [];

        images.forEach((image, index) => {
            // Get file name without extension for text
            const fileNameWithExt = image.name;
            const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')) || fileNameWithExt;

            // Add image card
            cardData.push({
                type: 'image',
                content: image.url,
                pairId: index
            });

            // Add text card
            cardData.push({
                type: 'text',
                content: fileName,
                pairId: index
            });
        });

        this.shuffleArray(cardData);
        this.createCustomCards(cardData);
    }

    createCustomCards(cardData) {
        cardData.forEach((data, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.pairId = data.pairId;

            const front = document.createElement('div');
            front.className = 'front';
            front.textContent = 'מיתרים ונהנים';

            const back = document.createElement('div');
            back.className = 'back';

            if (data.type === 'image') {
                const img = document.createElement('img');
                img.src = data.content;
                img.alt = `Card ${index + 1}`;
                back.appendChild(img);
            } else if (data.type === 'text') {
                const textDiv = document.createElement('div');
                textDiv.className = 'text-content';
                textDiv.textContent = data.content;
                back.appendChild(textDiv);
            }

            card.appendChild(front);
            card.appendChild(back);
            this.gameBoard.appendChild(card);

            card.addEventListener('click', () => this.flipCard(card));
            this.cards.push(card);
        });
    }

    flipCard(card) {
        if (this.isLocked) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;
        if (this.flippedCards.length >= 2) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            setTimeout(() => this.checkMatch(), 1000);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.pairId === card2.dataset.pairId;

        if (isMatch) {
            this.handleMatch(card1, card2);
        } else {
            this.handleMismatch(card1, card2);
        }
    }

    handleMatch(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.matchedPairs++;

        // Update score
        this.score += 10;
        this.scoreElement.textContent = this.score;

        this.flippedCards = [];
        this.isLocked = false;

        // Check for victory
        if (this.matchedPairs === this.cards.length / 2) {
            setTimeout(() => this.showVictory(), 500);
        }
    }

    handleMismatch(card1, card2) {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');

            this.flippedCards = [];
            this.isLocked = false;
        }, 500);

        // Reduce score for mistakes, but not below zero
        this.score = Math.max(0, this.score - 1);
        this.scoreElement.textContent = this.score;
    }

    showVictory() {
        this.victoryMessage.classList.remove('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});