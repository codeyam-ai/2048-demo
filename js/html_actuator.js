function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
  this.maxTile = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);

  this.showBadge(tile.value, true);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.showBadge = function (value, showBadgeArea) {
  const maxClaimedValue = window.maxClaimedValue === undefined ? 9999 : window.maxClaimedValue;
  if (value >= 16 && value >= this.maxTile && value > maxClaimedValue) {
    if (showBadgeArea) {
      document.getElementById('badge').style = '';
    }

    const badgeImage = document.getElementById('badge-image');
    const badgeDescription = document.getElementById('badge-description')

    const images = {
      16: {
        image: 'https://arweave.net/sv0csl4RG5ikMBuaACrvojm-EzcbTi-3ThScTTsVBdc',
        text: 'Casual Amateur'
      },
      32: {
        image: 'https://arweave.net/_t8bsaO1Q7RjoxRIZSXQRwtl916L7m8XwSjeWg1fBa8',
        text: 'Amateur'
      },
      64: {
        image: 'https://arweave.net/2fTevWYameF4ZJtu9NxgWqa_fGjQ_f8Da0qTwTOI_Dg',
        text: 'Impressive Amateur'
      },
      128: {
        image: 'https://arweave.net/1z_SHqdfIQBb6QvIKkhvVn14PmxjltZnRdFSdsoJIDQ',
        text: 'Novice Expert'
      },
      256: {
        image: 'https://arweave.net/b7o0WJcyD0BHVvQvlqbgy1HRUQW7iuHpxLalzyL061E',
        text: 'Growing Expert'
      },
      512: {
        image: 'https://arweave.net/ql44u1TetxqFQLYW2f-VDGQGS_ZwC9o68USpdEuwKbs',
        text: 'Expert'
      },
      1024: {
        image: 'https://arweave.net/_SOBVh01rBEEnbXxF5rx9MaQBKFbtM5tZdvq0qzoC7A',
        text: 'Amazing Expert'
      },
      2048: {
        image: 'https://arweave.net/QW9doLmmWdQ-7t8GZ85HtY8yzutoir8lGEJP9zOPQqA',
        text: 'Winner'
      }
    }

    badgeImage.src = images[value].image;
    badgeDescription.innerHTML = `This player has unlocked the ${value} tile on Ethos 2048. They are a ${images[value].text}!`;
    this.maxTile = value;
  }
};


HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
