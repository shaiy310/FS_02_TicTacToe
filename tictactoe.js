const BOARD_SIZE = 3;
const WINNING_LINES = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
];

$(document).ready(function () {
    // Set global state in the window scope
    window.appState = window.appState || {
        players: [
            { name: 'Player 1', type: 'Human', mark: 'X' },
            { name: 'Player 2', type: 'Human', mark: 'O' }
        ],
        currentPlayer: 0,
        isGameOver: false,
        board: []
    }
});

// Start Button Click Handler
$(document).on('click', '#Start', function () {
    if ([$('#player1Name').val(), $('#player2Name').val()].some(name => name.trim() === '')) {
        alert('Please enter names for both players.');
        return;
    }
    if ([$('#player1Mark').val(), $('#player2Mark').val()].some(mark => mark.trim() === '')) {
        alert('Please enter marks for both players.');
        return;
    }

    window.appState.players = [
        { name: $('#player1Name').val(), type: $('input[name="player1Type"]:checked').val(), mark: $('#player1Mark').val() },
        { name: $('#player2Name').val(), type: $('input[name="player2Type"]:checked').val(), mark: $('#player2Mark').val() }
    ];

    setControlsDisabled(true);
    document.querySelector('.board')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
    setupGame();
});

// Cell Click Handler
$(document).on('click', '.cell', function () {
    if (window.appState.isGameOver) return;

    const $cell = $(this);
    const row = parseInt($cell.attr('data-row'));
    const col = parseInt($cell.attr('data-col'));

    if ($cell.hasClass('occupied')) return;

    $cell.addClass('occupied');
    $cell.text(window.appState.players[window.appState.currentPlayer].mark);

    endCurrentPlayerTurn();
});

function setupGame() {
    window.appState.currentPlayer = 0;
    window.appState.isGameOver = false;

    generateBoard();
    startCurrentPlayerTurn();
}

function setControlsDisabled(disabled) {
    const controls = $('#controls');
    controls.attr('aria-disabled', disabled);
    controls.toggleClass('disabled', disabled);
    controls.find(':input').prop('disabled', disabled);
}

function generateBoard() {
    const boardUI = $('.board')
    
    boardUI.empty();
    window.appState.board = [];

    for (let y = 0; y < BOARD_SIZE; y++) {
        window.appState.board[y] = [];
        for (let x = 0; x < BOARD_SIZE; x++) {
            const $cell = $('<div class="cell"></div>');
            $cell.attr('data-col', `${x}`);
            $cell.attr('data-row', `${y}`);
            window.appState.board[y][x] = $cell;
            boardUI.append($cell);
        }
    }
}

function startCurrentPlayerTurn() {
    const currentPlayerInfo = window.appState.players[window.appState.currentPlayer];
    $("#message").text(currentPlayerInfo.name + ' turn to play');
    
    if (currentPlayerInfo.type === 'AI') {
        aiMove();
    }
}

function endCurrentPlayerTurn() {
    if (isGameOver(window.appState.currentPlayer)) {
        window.appState.isGameOver = true;
        setControlsDisabled(false);
        return;
    }

    swapPlayer();
}

function swapPlayer() {
    window.appState.currentPlayer = (window.appState.currentPlayer + 1) % 2;
    
    startCurrentPlayerTurn();
}

function aiMove() {
    const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
    const currentPlayerInfo = window.appState.players[window.appState.currentPlayer];
    const text = `${currentPlayerInfo.name} is thinking`;

    (async () => {
        await delay(200);
        for (let i = 0; i < 4; i++) {
            $("#message").text(`${text}${'.'.repeat(i)}`);
            await delay(200);
        }
        
        // Simple AI logic: choose a random empty cell
        const emptyCells = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!window.appState.board[y][x].hasClass('occupied')) {
                    emptyCells.push({ row: y, col: x });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const $cell = window.appState.board[randomCell.row][randomCell.col];
            $cell.addClass('occupied');
            $cell.text(window.appState.players[window.appState.currentPlayer].mark);
        }

        endCurrentPlayerTurn();
    })();
}

function isGameOver(mark) {
    const board = window.appState.board;
    const playerMark = window.appState.players[window.appState.currentPlayer].mark;

    console.log('Checking game over for mark:', playerMark);
    const winningLines = WINNING_LINES.filter((line) => {
        const belongsToMark = line.every(([lineRow, lineCol]) => board[lineRow][lineCol].text() === playerMark);
        return belongsToMark;
    });
    console.log('Winning lines:', winningLines);
    if (winningLines.length > 0) {
        markWinStrike(winningLines);
        return true;
    }

    console.log('Checking for tie...');
    if (!board.some((row) => {
        return row.some((cell) => { return !cell.hasClass('occupied') });                 
    })) {
        $("#message").text("It's a tie!");
        return true;
    }

    return false;
}

function markWinStrike(winningLines) {
    $("#message").text(window.appState.players[window.appState.currentPlayer].name + ' wins!');
    const board = window.appState.board;
    winningLines.forEach((line) => {
        line.forEach(([row, col]) => {
            board[row][col].addClass('winning');
        });
    });
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            board[y][x].addClass('occupied');
        }
    }
}


