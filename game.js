function Card(id, fill, shape, color, number) {
    this.id = id;
    this.color = color;
    this.number = number;
    this.shape = shape;
    this.fill = fill;
    return
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function checkSet(potentialSet) {

    const features = ['color', 'number', 'shape', 'fill'];

    let result = features.every((feature) => {
        // 1 and 2 are the same, and 3 is different
        if (potentialSet[0][feature] === potentialSet[1][feature] && potentialSet[1][feature] !== potentialSet[2][feature]) return false;
        // 1 and 3 are the same, and 2 is different
        if (potentialSet[0][feature] === potentialSet[2][feature] && potentialSet[1][feature] !== potentialSet[2][feature]) return false;
        // 2 and 3 are the same, and 1 is different
        if (potentialSet[1][feature] === potentialSet[2][feature] && potentialSet[2][feature] !== potentialSet[0][feature]) return false;
        return true;
    })

    return result;
}

function createDeck() {
    var deck = [];
    var id = 1;

    const colors = [
        'red',
        'purple',
        'green'
    ]

    const numbers = [
        '1',
        '2',
        '3'
    ]

    const shapes = [
        'worm',
        'diamond',
        'pill'
    ]

    const fills = [
        'solid',
        'stripe',
        'empty'
    ]

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                for (let l = 0; l < 3; l++) {
                    deck.push(new Card(id, fills[i], shapes[j], colors[k], numbers[l]));
                    id += 1;
                }
            }
        }
    }
    return deck;
}

function drawNewGame() {
    let cards = []
    do {
        deck = shuffle(createDeck());
        for (i = 0; i < 12; i++) {
            let c = deck.pop();
            c.selected = false;
            cards.push(deck.pop());
        }
    } while (checkForNoSet(cards));
    return cards;
}

var cardsState = [];
var selectedIndices = [];
var masterDeck = createDeck();
var deck = shuffle(createDeck());

var setsFound = 0;
var cardsLeft = deck.length - 12;

cardsState = drawNewGame();

renderCards(cardsState);
renderScoreBoard(cardsLeft, setsFound);

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function checkForSet(cardsState) {
    let selected = cardsState.filter((card) => {
        return card.selected === true;
    });

    if (selected.length >= 3) {
        return checkSet(selected);
    }
}

function gameOver() {
    console.log('no set possible, no cards left, game over');
    alert('you found all the sets!');
}

function addCardToSelection(index) {
    selectedIndices.push(index);
    cardsState[index].selected = true;
    if (selectedIndices.length >= 3) {
        if (checkForSet(cardsState)) {
            // we found a set!
            console.log(`user found a set: ${selectedIndices[0]}, ${selectedIndices[1]}, ${selectedIndices[2]}`);
            setsFound += 1;
            flashMsg('Set!')
            
            // sort selected indices in decending order to take care of the 
            // bug where removal removes the wrong stuff because the indices of
            // the cards in cardsstate changes after each removal.
            // https://stackoverflow.com/questions/9425009/remove-multiple-elements-from-array-in-javascript-jquery
            selectedIndices.sort((a,b) => {return b-a});

            // first check if were in the case where we had extra cards
            if (cardsState.length <= 12) {
                selectedIndices.forEach((i) => {
                    let c = deck.pop();
                    if (c !== undefined) {
                        // there are cards left, replace
                        // the set with the next 3 cards from the deck.
                        c.selected = false;
                        cardsState[i] = c;
                    } else {
                        // there are no cards in the deck. simply remove the cards.
                        cardsState.splice(i, 1);
                    }
                });
            } else {
                // we had to add extra cards, so just delete the set with splice.
                // since selectedIndices is sorted greatest -> least
                // we are removing from the end of the array
                // so we dont have to worry about cardStates order shifting mid
                // delete loop.
                selectedIndices.forEach((i) => {
                    cardsState.splice(i, 1);
                });
            }

            // check for no set
            if (checkForNoSet(cardsState)) {
                console.log('no set possible!')
                // if theres no set we gotta add three more cards!
                for (let i = 0; i < 3; i++) {
                    let c = deck.pop();
                    if (c !== undefined) {
                        c.selected = false;
                        cardsState.push(c);
                    } else {
                        // no set possible, no cards left in the deck, game over.
                        gameOver();
                        break;
                    }
                }
            }
        } else {
            console.log('no set');
            flashMsg('Not a Set.')
            selectedIndices.forEach((i) => {
                cardsState[i].selected = false;
            });
        }
        selectedIndices = [];
    }
    renderCards(cardsState);
    renderScoreBoard(deck.length, setsFound);
}

function removeCardFromSelection(index) {
    let i = selectedIndices.indexOf(index);
    if (i > -1) {
        selectedIndices.splice(i, 1);
    }
    cardsState[index].selected = false;
    renderCards(cardsState);
}

function flashMsg(msg) {
    var msgEl = document.querySelectorAll('#message')[0];
    msgEl.textContent = msg;
    // Add the "show" class to DIV
    msgEl.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => { msgEl.className = msgEl.className.replace = ("show", ""); }, 1200);
}

function renderCards(cardsState) {
    let parent = document.getElementById('cards-container');
    removeAllChildNodes(parent);
    cardsState.forEach((card, i) => {
        if (card !== undefined && card.id > 0) {
            let n = document.createElement('div');
            n.className = 'card-cell';
            if (card.selected) {
                n.classList.add('selected');
            }
            n.innerHTML = `<img src='images/${card.id}.png'>`;
            n.addEventListener("click", function () {
                if (n.classList.contains('selected')) {
                    removeCardFromSelection(i);
                } else {
                    addCardToSelection(i);
                }
            })
            parent.appendChild(n);
        }
    });

}

function renderScoreBoard(cardsLeft, setsFound) {
    var scoreBoardEl = document.getElementById('scoreboard');
    scoreBoardEl.innerHTML = `Found ${setsFound} sets. ${cardsLeft} cards left in the deck.`;
}

function checkForNoSet(cardsState) {
    for (let i = 0; i < cardsState.length; i++) {
        for (let j = i + 1; j < cardsState.length; j++) {
            for (let k = j + 1; k < cardsState.length; k++) {
                if (checkSet([cardsState[i], cardsState[j], cardsState[k]])) {
                    console.log(`computer found set: ${i} ${j} ${k}`)
                    return false
                }
            }
        }
    }
    return true;
}

