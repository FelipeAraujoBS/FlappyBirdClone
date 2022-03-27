//function to create new Elements in the HTML page
//Função construtora de novos Elementos no HTML.
function newElement(tagName, className){  
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

//Function who create a new div in the HTML, corresponding to the barrier in the game
//Funçao que criar uma nova div, correspondente a barreira no jogo. 
function barrier(reverse = false){
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

//Function who compiled both the "normal" and reverse barriers, creating a pair.
//Função que compilou tanto o tipo "normal" quanto o tipo reverse das barreiras, criando uma par.
function pairOfBarriers(height, opening, x){
    this.element = newElement('div', 'pair-of-barriers')

    this.upper = new barrier(true)
    this.lower = new barrier(false)

    this.element.appendChild(this.upper.element)
    this.element.appendChild(this.lower.element)

    //Arrow function responsible to randomize the height of the barriers, adding complexity to the game
    //Função arrow responsavel por randomizar a altura dos pares de barreiras, adicionando complexitade ao jogo!
    this.openingRandom = () => {
        const upperHeight = Math.random() * (height - opening)
        const lowerHeight = height - opening - upperHeight
        this.upper.setHeight(upperHeight)
        this.lower.setHeight(lowerHeight)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.openingRandom()
    this.setX(x)
}

//This function creates the barriers itself, with they own height, opening, width and space between
//Essa função cria as barreiras em si, com seus proprios parametros, altura, abertura, largura e espaço entre si.
function Barriers(height, width, opening, spaceBetween, notifyPoints){
    this.pairs = [
        new pairOfBarriers(height, opening, width),
        new pairOfBarriers(height, opening, width + spaceBetween),
        new pairOfBarriers(height, opening, width + spaceBetween * 2),
        new pairOfBarriers(height, opening, width + spaceBetween * 3)
    ]

//Deslocation rate of the barriers, the number of pixels for second 
//A taxa de deslocamento da barreira, o numero de pixels por segundo.
    const deslocation = 3

//Responsable for the animation of the motion of the barriers.
//Responsavel pela animação do movimento das barreiras.
    this.animar = () =>{
        this.pairs.forEach(pair =>{
            pair.setX(pair.getX() - deslocation)

            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + spaceBetween * this.pairs.length)
                pair.openingRandom()
            }

            //Indicate the middle of the game, the threshold to make a point.
            //Indica o meio do jogo, o limiar para fazer um ponto.
            const middle = width / 2
            const crossMiddle = pair.getX() + deslocation >= middle && pair.getX() < middle

            if(crossMiddle) notifyPoints() //if the player crossed the middle, the game is notify with 1 point.
                                           //Se o jogador cruza o meio, o jogo é notificado com 1 ponto.
        })
    }
}

//Function who create the bird, the controllable creature of the game.
//Funcção que cria o passaro, a criatura controlável do jogo.
function Bird(gameHeight){
    let flying = false

    this.element = newElement('img', 'bird')
    this.element.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => flying = true 
    window.onkeyup = e => flying = false

    this.animar = () => {
        const newY = this.getY() + (flying ?  15 : -5)
        const maxHeight = gameHeight - this.element.clientHeight
  
        if (newY <= 0){  
            this.setY(0)
        } else if (newY >= maxHeight){ 
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points 
    }
    this.updatePoints(0) //Here, the points notifies for the game will be show on the players screen
                        //Aqui, os pontos que foram notificados para o jogo serão mostrados na tela do jogador.

}

//Function responsible to limited the bouding the rectangular shape of each element in the game.
//Função responsavel por delimitar o formato retangular de cada elemento no jogo.
function areSuper(elementA, elementB){
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left //Boolean representing the overlap of elements
    && b.left + b.width >= a.left                 //Boolean representando a sobreposição de elementos

    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top 

    return horizontal && vertical
}

//If the overlap is true, the colision function will be called
//Se a sobreposição for verdadeira, a função de colisão será chamada
function colision(Bird, Barriers){
    let colision = false

    Barriers.pairs.forEach(pairOfBarriers => { 
        if (!colision) {
            const upper = pairOfBarriers.upper.element
            const lower = pairOfBarriers.lower.element

            colision = areSuper(Bird.element, upper) || areSuper(Bird.element, lower)
        }
    })
    return colision
}

function refresh(){
    document.location.reload(true)
}

//The game itself, everything that will be displayed on the screen
//O jogo em si, tudo que será mostrado na tela, atráves dos parametros acima.
function FlappyBird(){
    let points = 0 

    const gameArea = document.querySelector('[flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 300, 400, 
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))
    
    //Loop of the game
    //Loop do jogo
    this.start = () => {
        const timer = setInterval(() => {
            barriers.animar()
            bird.animar()

            if(colision(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()

 





