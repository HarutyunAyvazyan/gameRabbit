

const WOLF = "w";
const RABBIT = "r";
const HOME = "h";
const FENCE = "f";
const WOLF_PERCENT = 60
const FENCE_PERCENT = 40
const imagesHeroes = {
    rabbit: "./images/rabbit.jpg",
    wolf: "./images/wolf.jpg",
    home: "./images/home.jpg",
    fence: "./images/fence.jpg"
}

const insertHero = (matrix, heroName) => {
    const x = parseInt(Math.random() * (matrix.length))
    const y = parseInt(Math.random() * (matrix.length))
    if (matrix[x][y] === 0) {
        matrix[x][y] = heroName
    } else {
        return insertHero(matrix, heroName)
    }
    return matrix
}

const calculatePercent = (number, percent) => (number * percent) / 100;

const insertSingleHero = (matrix, heroName, percent = 1) => {
    if (heroName === WOLF || heroName === FENCE) {
        percent = calculatePercent(matrix.length, percent)
    }
    for (let i = 0; i < percent; i++) {
        insertHero(matrix, heroName)
    }
    return matrix
}

const inserAllHeroes = (matrix) => {
    insertSingleHero(matrix, WOLF, WOLF_PERCENT)
    insertSingleHero(matrix, FENCE, FENCE_PERCENT)
    insertSingleHero(matrix, RABBIT)
    insertSingleHero(matrix, HOME)
}
const getHeroCoords = (matrix, hero) => {
    const findCords = (acc, val, x) => {
        val.forEach((elm, y) => {
            if (elm === hero) {
                acc.push([x, y])
            }
        })
        return acc
    }
    return matrix.reduce(findCords, [])
}



const rabbitDirection = (direction, matrix) => {
    const [x, y] = getHeroCoords(matrix, RABBIT).flat()
    if (direction === "ArrowRight") {
        return [x, y + 1]
    } else if (direction === "ArrowLeft") {
        return [x, y - 1]
    } else if (direction === "ArrowUp") {
        return [x - 1, y]
    } else if (direction === "ArrowDown") {
        return [x + 1, y]
    }
}

const teleport = (matrix, [x, y]) => {
    const maxValue = matrix.length
    x = (x + maxValue) % maxValue
    y = (y + maxValue) % maxValue
    return [x, y]
}

const stepsCordsRabbit = (gameState, [nextStepsRabbitCordsX, nextStepsRabbitCordsY]) => {
    const matrix = gameState.matrix
    const [initialRabbitX, initialRabbitY] = getHeroCoords(matrix, RABBIT).flat()
    const [rabbitCordsX, rabbitCordsY] = teleport(matrix, [nextStepsRabbitCordsX, nextStepsRabbitCordsY])
    if (matrix[rabbitCordsX][rabbitCordsY] === 0) {
        matrix[rabbitCordsX][rabbitCordsY] = RABBIT
        matrix[initialRabbitX][initialRabbitY] = 0
    }
    if (matrix[rabbitCordsX][rabbitCordsY] === HOME) {
        gameState.gameRunning = false
        gameState.message = "YOU WIN"
    }

    return gameState
}

const calculateDistance = ([rabbitX, rabbitY], [wolfX, wolfY]) =>
    Math.sqrt(Math.abs(Math.pow((rabbitX - wolfX), 2)) + Math.abs(Math.pow((rabbitY - wolfY), 2)))

const getNearestCell = ([rabbitX, rabbitY], wolvesNeighboringCoords) => {
    if (wolvesNeighboringCoords.length === 0) {
        return []
    }
    const distances = wolvesNeighboringCoords.map(cell => calculateDistance([rabbitX, rabbitY], cell))
    const nearestIndex = minDistanceWolfsIndex(distances)
    return wolvesNeighboringCoords[nearestIndex]
}

const possibleMoveWolfs = (gameState) => {
    const matrix = gameState.matrix
    return getHeroCoords(matrix, WOLF).map(val => neighboringCordsWolf(matrix, val))
}

const checkCells = (gameState, coords) => coords.filter(([x, y]) => {
    const matrix = gameState.matrix
    if (matrix[x][y] === RABBIT) {
        gameState.gameRunning = false,
            gameState.message = "GAME OVER"
        return gameState
    }
    return matrix[x][y] === 0
})

const moveHero = (matrix, [fromX, fromY], to) => {
    if (to.length === 0) {
        return
    }
    const [toX, toY] = to
    matrix[fromX][fromY] = 0
    matrix[toX][toY] = WOLF
}

const minDistanceWolfsIndex = (distanceWolf) =>
    distanceWolf.indexOf(Math.min(...distanceWolf))

const range = (matrix, [x, y]) => x >= 0 && x < matrix.length && y >= 0 && y < matrix.length

const neighboringCordsWolf = (matrix, [x, y]) => {
    const cells = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ]
    return cells.filter(cell => range(matrix, cell))
}

const moveWolves = (gameState) => {
    const matrix = gameState.matrix
    const rebbitCoords = getHeroCoords(matrix, RABBIT)[0]
    const wolvesCoords = getHeroCoords(matrix, WOLF)
    wolvesCoords.map(singleWolf => {
        const possibleMoves = neighboringCordsWolf(matrix, singleWolf)
        const isEmptyCellOrRabbit = checkCells(gameState, possibleMoves)
        const nearestCell = getNearestCell(rebbitCoords, isEmptyCellOrRabbit)

        moveHero(matrix, singleWolf, nearestCell)

    })
    return gameState
}

const moveRabbit = (event, gameState) => {

    const coords = rabbitDirection(event.key, gameState.matrix)
    if (coords === undefined) {
        return
    }
    const newGameState = stepsCordsRabbit(gameState, coords)
    if (!gameState.gameRunning) {
        return gameState
    }
    moveWolves(newGameState)
    createGameBoard(newGameState.matrix)
}

const createMatrix = (matrixSize) => new Array(matrixSize)
    .fill(0)
    .map(matrixElm => matrixElm = new Array(matrixSize)
        .fill(0))

const getElementById = (id) => document.getElementById(id)

const createElement = (id) => document.createElement(id)

const createDiv = (hero) => {
    const container = createElement("div")
    container.style = `
     width:80px;
     height:80px;
     background:red;
     padding:1px;
     border: 1px solid grey;
        `
    if (hero === RABBIT) {
        container.append(createImage(imagesHeroes.rabbit))
    }
    if (hero === WOLF) {
        container.append(createImage(imagesHeroes.wolf))
    }
    if (hero === HOME) {
        container.append(createImage(imagesHeroes.home))
    }
    if (hero === FENCE) {
        container.append(createImage(imagesHeroes.fence))
    }
    return container
}

const createImage = (srcImage) => {
    const source = createElement("img")
    source.style = `
   width:80px;
   height:80px
   `
    source.src = srcImage
    return source

}

const containerDiv = (matrixSize) => {
    const container = createElement("div")
    container.style = `
     width:${parseInt(matrixSize) * 80 + parseInt(matrixSize) * 4}px;
     display:flex;
     flex-wrap:wrap;
     box-sizing: border-box;
    `
    return container
}

const createGameBoard = (matrix) => {
    const root = getElementById("root")
    const messageDiv = getElementById("message")
    messageDiv.style.display = "none"
    root.style.display = "block"

    clearGameBoard()
    const matrixSize = matrix.length
    const container = containerDiv(matrixSize)
    root.append(container)
    matrix.forEach((arr) => arr.forEach(
        (cell) => {
            container.append(createDiv(cell))
        }
    ))
    return root
}

const clearGameBoard = () => {
    const root = getElementById("root")
    root.innerHTML = ""
}

const newGameStart = () => {
    gameStartButton.addEventListener("click", gameStart)
}



const createMessage = (gameState, text, eventMove) => {

    const root = getElementById("root")
    const messageDiv = getElementById("message")
    messageDiv.innerHTML = ""
    const message = document.createElement("h1")
    message.innerHTML = text


    if (!gameState.gameRunning) {
        root.style.display = "none"
        messageDiv.style.display = "block"
        message.style = `
        font-size:60px;
        text-align:center;
        `
        messageDiv.append(message)
        document.removeEventListener("keydown", eventMove);
        newGameStart()
    }
}


const gameStart = () => {
    const selectVal = parseInt(getElementById("select").value)
    const gameState = {
        gameRunning: true,
        matrix: createMatrix(selectVal),
        message: ""
    }
    const eventMove = (event) => {
        moveRabbit(event, gameState)
        createMessage(gameState, gameState.message, eventMove)
    }
    inserAllHeroes(gameState.matrix)
    clearGameBoard()
    createGameBoard(gameState.matrix)
    document.addEventListener("keydown", eventMove)

}
const gameStartButton = getElementById("gameStart")

gameStartButton.addEventListener("click", gameStart)








