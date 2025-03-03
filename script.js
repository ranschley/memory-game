document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game');
    const uploadImagesBtn = document.getElementById('upload-images');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const modeSelectModal = document.getElementById('mode-select-modal');
    const victoryModal = document.getElementById('victory-modal');
    const imageUpload = document.getElementById('image-upload');
    const uploadError = document.getElementById('upload-error');
    const startGameBtn = document.getElementById('start-game-btn');
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const modeInstruction = document.getElementById('mode-instruction');
    const modeRadios = document.querySelectorAll('input[name="game-mode"]');

    // Close buttons
    const closeButtons = document.querySelectorAll('.close');

    // Game state
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let gameMode = 'identical'; // default mode
    let customImages = [];
    let isProcessing = false;

    // Default images (8 pairs)
    const defaultImages = [
        'img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg',
        'img/5.jpg', 'img/6.jpg', 'img/7.jpg', 'img/8.jpg'
    ];

    // Initialize game with default images
    initGame(defaultImages);

    // Event listeners
    newGameBtn.addEventListener('click', () => {
        resetGame();
        if (customImages.length > 0) {
            createGameCards(customImages);
        } else {
            initGame(defaultImages);
        }
    });

    uploadImagesBtn.addEventListener('click', () => {
        modeSelectModal.style.display = 'block';
        uploadError.style.display = 'none';
        updateModeInstructions();
    });

    modeRadios.forEach(radio => {
        radio.addEventListener('change', updateModeInstructions);
    });

    function updateModeInstructions() {
        const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
        switch (selectedMode) {
            case 'identical':
                modeInstruction.textContent = 'יש להעלות 8 תמונות';
                break;
            case 'different':
                modeInstruction.textContent = 'יש להעלות 16 תמונות, עם הסיומות \'1\' ו\'2\'';
                break;
            case 'text':
                modeInstruction.textContent = 'יש להעלות 8 תמונות, שם הקובץ ישמש כטקסט לכרטיס המתאים';
                break;
        }
    }

    startGameBtn.addEventListener('click', () => {
        const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;
        gameMode = selectedMode;

        if (!validateUploadedImages()) {
            return; // Error message is displayed by validateUploadedImages
        }

        modeSelectModal.style.display = 'none';
        resetGame();
        createGameCards(customImages);
    });

    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        customImages = [];
        uploadError.style.display = 'none';

        if (files.length === 0) return;

        // Clear previous error
        uploadError.textContent = '';
        uploadError.style.display = 'none';

        // Process files based on mode
        const selectedMode = document.querySelector('input[name="game-mode"]:checked').value;

        switch (selectedMode) {
            case 'identical':
                if (files.length !== 8) {
                    uploadError.textContent = 'יש להעלות בדיוק 8 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return;
                }
                break;

            case 'different':
                if (files.length !== 16) {
                    uploadError.textContent = 'יש להעלות בדיוק 16 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return;
                }
                break;

            case 'text':
                if (files.length !== 8) {
                    uploadError.textContent = 'יש להעלות בדיוק 8 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return;
                }
                break;
        }

        // Process each file to create URL
        for (const file of files) {
            const imageUrl = URL.createObjectURL(file);
            customImages.push({
                url: imageUrl,
                name: file.name
            });
        }
    });

    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'block';
    });

    // Close button functionality
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modeSelectModal) {
            modeSelectModal.style.display = 'none';
        }
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    document.getElementById('victory-new-game').addEventListener('click', () => {
        victoryModal.style.display = 'none';
        resetGame();
        if (customImages.length > 0) {
            createGameCards(customImages);
        } else {
            initGame(defaultImages);
        }
    });

    // Game Functions
    function initGame(images) {
        gameMode = 'identical'; // Reset to default mode for default images
        const gameImages = [...images, ...images]; // Duplicate for pairs
        shuffleArray(gameImages);
        createDefaultCards(gameImages);
    }

    function validateUploadedImages() {
        if (customImages.length === 0) {
            uploadError.textContent = 'יש להעלות תמונות כדי להתחיל משחק';
            uploadError.style.display = 'block';
            return false;
        }

        // Validate based on game mode
        switch (gameMode) {
            case 'identical':
                if (customImages.length !== 8) {
                    uploadError.textContent = 'יש להעלות בדיוק 8 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return false;
                }
                break;

            case 'different':
                if (customImages.length !== 16) {
                    uploadError.textContent = 'יש להעלות בדיוק 16 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return false;
                }

                // Check pairs naming convention
                const baseNames = new Set();
                const pairMap = {};

                for (const image of customImages) {
                    const filename = image.name.split('.')[0];
                    if (!filename.endsWith('1') && !filename.endsWith('2')) {
                        uploadError.textContent = 'שמות התמונות חייבים להסתיים ב-\'1\' או \'2\', לדוגמה: \'זברה1.jpg\' ו-\'זברה2.jpg\'';
                        uploadError.style.display = 'block';
                        return false;
                    }

                    const baseName = filename.slice(0, -1); // Remove the last character (1 or 2)
                    baseNames.add(baseName);

                    if (!pairMap[baseName]) {
                        pairMap[baseName] = [];
                    }
                    pairMap[baseName].push(image);
                }

                // Check if we have exactly 8 pairs
                if (baseNames.size !== 8) {
                    uploadError.textContent = 'יש להעלות בדיוק 8 זוגות של תמונות (16 תמונות בסך הכל)';
                    uploadError.style.display = 'block';
                    return false;
                }

                // Check if each base name has exactly 2 files
                for (const baseName of baseNames) {
                    if (pairMap[baseName].length !== 2) {
                        uploadError.textContent = `לא נמצאו 2 תמונות לבסיס השם '${baseName}'`;
                        uploadError.style.display = 'block';
                        return false;
                    }

                    // Check if we have both '1' and '2' suffixes
                    const suffixes = pairMap[baseName].map(img => img.name.split('.')[0].slice(-1));
                    if (!suffixes.includes('1') || !suffixes.includes('2')) {
                        uploadError.textContent = `לבסיס השם '${baseName}' חסרה תמונה עם סיומת '1' או '2'`;
                        uploadError.style.display = 'block';
                        return false;
                    }
                }
                break;

            case 'text':
                if (customImages.length !== 8) {
                    uploadError.textContent = 'יש להעלות בדיוק 8 תמונות למצב זה';
                    uploadError.style.display = 'block';
                    return false;
                }
                break;
        }

        return true;
    }

    function createDefaultCards(images) {
        gameBoard.innerHTML = '';
        cards = [];

        images.forEach((image, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.id = index;
            card.dataset.image = image;

            // Create card front
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = 'מיתרים ונהנים';

            // Create card back
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');

            const img = document.createElement('img');
            img.src = image;
            cardBack.appendChild(img);

            // Append elements
            card.appendChild(cardFront);
            card.appendChild(cardBack);
            gameBoard.appendChild(card);

            // Add click event
            card.addEventListener('click', flipCard);
            cards.push(card);
        });
    }

    function createGameCards(images) {
        gameBoard.innerHTML = '';
        cards = [];

        switch (gameMode) {
            case 'identical':
                // Duplicate and shuffle images
                let gameDeck = [];
                images.forEach(image => {
                    gameDeck.push(image, image);
                });
                shuffleArray(gameDeck);

                // Create cards
                gameDeck.forEach((image, index) => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.id = index;
                    card.dataset.pairId = images.indexOf(image);

                    // Create card front
                    const cardFront = document.createElement('div');
                    cardFront.classList.add('card-front');
                    cardFront.textContent = 'מיתרים ונהנים';

                    // Create card back
                    const cardBack = document.createElement('div');
                    cardBack.classList.add('card-back');

                    const img = document.createElement('img');
                    img.src = image.url;
                    cardBack.appendChild(img);

                    // Append elements
                    card.appendChild(cardFront);
                    card.appendChild(cardBack);
                    gameBoard.appendChild(card);

                    // Add click event
                    card.addEventListener('click', flipCard);
                    cards.push(card);
                });
                break;

            case 'different':
                // Group images by base name
                const pairGroups = {};
                images.forEach(image => {
                    const filename = image.name.split('.')[0]; // Remove extension
                    const baseName = filename.slice(0, -1); // Remove the last character (1 or 2)

                    if (!pairGroups[baseName]) {
                        pairGroups[baseName] = [];
                    }
                    pairGroups[baseName].push(image);
                });

                // Create an array of pairs
                let gameDeck = [];
                Object.values(pairGroups).forEach((pair, pairId) => {
                    pair.forEach(image => {
                        gameDeck.push({
                            image: image,
                            pairId: pairId
                        });
                    });
                });

                shuffleArray(gameDeck);

                // Create cards
                gameDeck.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.id = index;
                    card.dataset.pairId = item.pairId;

                    // Create card front
                    const cardFront = document.createElement('div');
                    cardFront.classList.add('card-front');
                    cardFront.textContent = 'מיתרים ונהנים';

                    // Create card back
                    const cardBack = document.createElement('div');
                    cardBack.classList.add('card-back');

                    const img = document.createElement('img');
                    img.src = item.image.url;
                    cardBack.appendChild(img);

                    // Append elements
                    card.appendChild(cardFront);
                    card.appendChild(cardBack);
                    gameBoard.appendChild(card);

                    // Add click event
                    card.addEventListener('click', flipCard);
                    cards.push(card);
                });
                break;

            case 'text':
                let textGameDeck = [];

                // Create image cards and text cards
                images.forEach((image, index) => {
                    // Get file name without extension for text
                    const fileNameWithExt = image.name;
                    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.')) || fileNameWithExt;

                    // Add image card
                    textGameDeck.push({
                        type: 'image',
                        content: image.url,
                        pairId: index
                    });

                    // Add text card
                    textGameDeck.push({
                        type: 'text',
                        content: fileName,
                        pairId: index
                    });
                });

                shuffleArray(textGameDeck);

                // Create cards
                textGameDeck.forEach((item, index) => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.id = index;
                    card.dataset.pairId = item.pairId;

                    // Create card front
                    const cardFront = document.createElement('div');
                    cardFront.classList.add('card-front');
                    cardFront.textContent = 'מיתרים ונהנים';

                    // Create card back
                    const cardBack = document.createElement('div');
                    cardBack.classList.add('card-back');

                    if (item.type === 'image') {
                        const img = document.createElement('img');
                        img.src = item.content;
                        cardBack.appendChild(img);
                    } else {
                        const textDiv = document.createElement('div');
                        textDiv.classList.add('text-content');
                        textDiv.textContent = item.content;
                        cardBack.appendChild(textDiv);
                    }

                    // Append elements
                    card.appendChild(cardFront);
                    card.appendChild(cardBack);
                    gameBoard.appendChild(card);

                    // Add click event
                    card.addEventListener('click', flipCard);
                    cards.push(card);
                });
                break;
        }
    }

    function flipCard() {
        if (isProcessing) return;
        if (this.classList.contains('flipped') || this.classList.contains('matched')) return;
        if (flippedCards.length >= 2) return;

        this.classList.add('flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            isProcessing = true;
            setTimeout(checkForMatch, 1000);
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;

        // In identical mode, compare image URLs
        // In different and text modes, compare pairId
        let isMatch = false;

        if (gameMode === 'identical' && card1.dataset.image === card2.dataset.image) {
            isMatch = true;
        } else if ((gameMode === 'different' || gameMode === 'text') &&
                   card1.dataset.pairId === card2.dataset.pairId) {
            isMatch = true;
        }

        if (isMatch) {
            // It's a match
            card1.classList.add('matched');
            card2.classList.add('matched');
            flippedCards = [];
            matchedPairs++;

            // Update score - more points for finding matches quicker
            score += 10;
            scoreElement.textContent = score;

            // Check for victory
            if (matchedPairs === 8) { // 8 pairs in the game
                finalScoreElement.textContent = score;
                setTimeout(() => {
                    victoryModal.style.display = 'block';
                }, 500);
            }
        } else {
            // Not a match, flip cards back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 500);

            // Reduce score on mistake, but not below zero
            score = Math.max(0, score - 1);
            scoreElement.textContent = score;
        }

        isProcessing = false;
    }

    function resetGame() {
        gameBoard.innerHTML = '';
        cards = [];
        flippedCards = [];
        matchedPairs = 0;
        score = 0;
        scoreElement.textContent = score;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});