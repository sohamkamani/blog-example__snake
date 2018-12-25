let boardWidth, boardHeight, ctx, imgHead, imgBody, imgFood, state
const blockSize = 20

const getRandomFoodPosition = () => ({
  x: Math.floor(Math.random() * (boardWidth / blockSize)),
  y: Math.floor(Math.random() * (boardHeight / blockSize))
})

const resetState = () => ({
  snake: {
    body: [ { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 } ],
    direction: 'UP',
    size: 3
  },
  food: getRandomFoodPosition()
})

// In the real world, the "input" will be replaced by
// the actual input device API (like a keyboard or controller)
const input = {
  upKeyPressed: false,
  downKeyPressed: false,
  leftKeyPressed: false,
  rightKeyPressed: false,
  reset: function () {
    this.upKeyPressed = false
    this.downKeyPressed = false
    this.leftKeyPressed = false
    this.rightKeyPressed = false
  }
}

const update = () => {
  // Change the direction of the snake if one of the movement keys is pressed
  if (state.snake.direction === 'UP' || state.snake.direction === 'DOWN') {
    // THe snake can only go left or right, if it's facing up or down
    if (input.leftKeyPressed) {
      state.snake.direction = 'LEFT'
      input.reset()
    } else if (input.rightKeyPressed) {
      state.snake.direction = 'RIGHT'
      input.reset()
    }
  }
  if (state.snake.direction === 'LEFT' || state.snake.direction === 'RIGHT') {
    // The snake can only go up or down, if its facing left or right
    if (input.upKeyPressed) {
      state.snake.direction = 'UP'
      input.reset()
    } else if (input.downKeyPressed) {
      state.snake.direction = 'DOWN'
      input.reset()
    }
  }

  //Get the head of the snake
  const head = state.snake.body[0]

  //Calculate the next position of the head based on the direction of the snake
  const nextPos = {
    x: head.x,
    y: head.y
  }
  switch (state.snake.direction) {
    case 'UP':
      nextPos.y -= 1
      break
    case 'DOWN':
      nextPos.y += 1
      break
    case 'LEFT':
      nextPos.x -= 1
      break
    case 'RIGHT':
      nextPos.x += 1
      break
  }

  // If the snake has found food, add a segment to the snakes body
  // The position is left blank (0, 0) for now
  if (head.x === state.food.x && head.y === state.food.y) {
    state.snake.body.push({
      x: 0,
      y: 0
    })
    state.food = getRandomFoodPosition()
  }

  if (head.x < 0 || head.x > boardWidth / blockSize || (head.y < 0 || head.y > boardHeight / blockSize)) {
    state = resetState()
    return
  }
  for (let i = 1; i < state.snake.body.length; i++) {
    if (state.snake.body[i].x === head.x && state.snake.body[i].y === head.y) {
      state = resetState()
      return
    }
  }
  // Now we assign the next position of a segment of a snakes
  // body to the current position of the previous segment
  // this "moves" the entire snake body while maintaining
  // the shape that the snake was in
  for (let i = state.snake.body.length - 1; i >= 0; i--) {
    // For the "head" of the snake, there is no previous segment, so we
    // assign the calculated `nextPos` variable as its next position
    let nextSegment = i === 0 ? nextPos : state.snake.body[i - 1]
    state.snake.body[i].x = nextSegment.x
    state.snake.body[i].y = nextSegment.y
  }
}

document.addEventListener('keydown', (e) => {
  switch (e.keyCode) {
    case 38:
      input.upKeyPressed = true
      break
    case 40:
      input.downKeyPressed = true
      break
    case 37:
      input.leftKeyPressed = true
      break
    case 39:
      input.rightKeyPressed = true
      break
  }
})

const rotateAngles = {
  RIGHT: 0,
  LEFT: Math.PI,
  DOWN: Math.PI / 2,
  UP: 3 * Math.PI / 2
}

const render = () => {
  // Clear all elements currently on the canvas
  ctx.clearRect(0, 0, boardWidth, boardHeight)

  // Draw the food
  // Here, `state.food.x` corresponds to the in-game co-ordinate system
  // and `blocksize` is the scaling factor
  ctx.drawImage(imgFood, state.food.x * blockSize, state.food.y * blockSize)
  const head = state.snake.body[0]

  ctx.save()
  ctx.translate(head.x * blockSize, head.y * blockSize)
  ctx.translate(blockSize / 2, blockSize / 2)
  ctx.rotate(rotateAngles[state.snake.direction])
  ctx.drawImage(imgHead, -blockSize / 2, -blockSize / 2)
  ctx.restore()

  for (let i = 1; i < state.snake.body.length; i++) {
    // Finally, we draw each block of the snakes body
    ctx.drawImage(imgBody, state.snake.body[i].x * blockSize, state.snake.body[i].y * blockSize)
  }
}

window.onload = () => {
  const c = document.getElementById('my-canvas')
  boardWidth = parseInt(c.getAttribute('width'))
  boardHeight = parseInt(c.getAttribute('height'))

  ctx = c.getContext('2d')

  const start = () => {
    let frameCount = -1
    const frameCountReset = 20
    state = resetState()
    console.log(state)
    const nextFrame = () => {
      frameCount = (frameCount + 1) % frameCountReset
      if (frameCount !== 0) {
        requestAnimationFrame(nextFrame)
        return
      }
      update()
      render()
      requestAnimationFrame(nextFrame)
    }
    requestAnimationFrame(nextFrame)
    ctx.drawImage(imgHead, 10, 10)
  }

  let loadedImageCount = 0
  const loadImg = (src) => {
    const img = new Image()
    img.onload = () => {
      loadedImageCount += 1
      if (loadedImageCount === 3) {
        start()
      }
    }
    img.src = src
    return img
  }
  imgHead = loadImg('head.png')
  imgBody = loadImg('body.png')
  imgFood = loadImg('food.png')
}
