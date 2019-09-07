/******************************************************************************/
/***************************   GAME SETUP   ***********************************/
/******************************************************************************/
const COLUMN_NO = 16;
const ROW_NO = 16;
const MINE_NO = 25;

let board;  // a <table> element
let cells;  // all <td> elements
let targets = {
  all: undefined,  // [array] - all cell ids representing cells (e.g. "0742")
  mined: undefined,  // [array] - only the ids for the mined cells
  safe: undefined  // [array] - only the ids for empty cells
}

document.addEventListener("DOMContentLoaded", () => {
  board = initializeBoard(COLUMN_NO, ROW_NO);
  cells = board.querySelectorAll("td");
  targets.all = getAllTargets(cells);
  targets.mined = placeMines(targets.all, MINE_NO);
  targets.safe = findSafeTargets(targets.all, targets.mined)
  cells.forEach( cell => {
    cell.addEventListener("click", handleLeftClick);
    cell.addEventListener("contextmenu", handleRightClick);
  })
});

/******************************************************************************/
/***********************   FUNCTION DECLARATIONS   ****************************/
/******************************************************************************/

function initializeBoard(numberOfRows, numberOfColumns) {
  let board = document.createElement("table");
  for (let rowNo = 1; rowNo <= numberOfRows; rowNo++) {
    let row = document.createElement("tr");
    for (let columnNo = 1; columnNo <= numberOfColumns; columnNo++) {
      let cell = document.createElement("td");
      cell.id = parseTwoDigitStr(rowNo) + parseTwoDigitStr(columnNo); // eg. "0612"
      row.append(cell);
    }
    board.append(row);
  }
  document.querySelector(".board-wrapper").append(board);
  return board
}

function parseTwoDigitStr(number) {
  return number < 10 ? "0" + number.toString() : number.toString()
};

function getAllTargets(cells) {
  return [...cells.values()].map( cell => cell.id )
}

function placeMines(allTargets, numberOfMines) {
  let allMines = [];
  for (let i = 0; i < numberOfMines; i++) {
    let mine = allTargets[Math.floor(Math.random() * allTargets.length)];
    while(allMines.includes(mine)) {
      // in case if target is already mined
      mine = allTargets[Math.floor(Math.random() * allTargets.length)];
    }
    allMines.push(mine);
  }
  return allMines
}

function findSafeTargets(allTargets, minedTargets) {
  return allTargets.filter( target => !minedTargets.includes(target) )
}

function handleRightClick(e) {
  e.preventDefault();
  markCell(e.target)
}

function markCell(cell) {
  if (cell.className !== "open") {
    if (cell.className !== "marked") {
      cell.className = "marked"
    } else {
      cell.className = ""
    }
  }
}

function handleLeftClick(e) {
  e.preventDefault();
  openCell(e.target, targets);
}

function openCell(cell, targets) {
  if (cell.className !== "marked") {
    revealCellContent(cell, targets);
    let defeat = checkDefeat(cell.id, targets.mined);
    if (defeat) {
      revealMines(targets.mined, "mine-exploded");
      revealSafeCells(targets);
      endGame("game-lost", cells);
    } else {
      let victory = checkVictory(targets.safe);
      if (victory) {
        revealMines(targets.mined, "mine-avoided");
        endGame("game-won", cells);
      }
    }
  }
};

function revealCellContent(cell, targets) {
  let dangerLevel = assignDangerLevel(cell.id, targets);
  if (dangerLevel === 0) {
    cell.className = "open";
    chainOpenNeighbors(cell, targets);
  } else {
    cell.innerHTML = dangerLevel
    cell.className = "open";
  }
};

function chainOpenNeighbors(cell, targets) {
  /**
    * @desc opens the empty neighbor cells in all directions recursively.
    * @method creates a queue of neighbor cells to be checked,
    * checks each cell, opens it showing it's danger level
    * if the cell is empty, adds its empty neighbors to the queue,
    * if the cell is dangerous, does not check its empty neighbors
  */

  let neighborTargets = findNeighborTargets(cell.id, targets.all);
  safeNeighborTargets = filterBySafety(neighborTargets, targets.safe)

  let targetSetToCheck = new Set(safeNeighborTargets) // set prevents duplicate targets
  while( targetSetToCheck.size > 0 ) {
    targetSetToCheck.forEach( cTarget => {
      let cCell = document.getElementById(cTarget)
      targetSetToCheck.delete(cTarget)

      if(cCell.className !== "open") {
        cCell.className = "open"
        let dangerLevel = assignDangerLevel(cTarget, targets);
        if(dangerLevel === 0) {
          let newNeighborTargets = findNeighborTargets(cTarget, targets.all);
          let newsafeNeighborTargets = filterBySafety(newNeighborTargets, targets.safe);
          newsafeNeighborTargets.forEach( nsnTarget => targetSetToCheck.add(nsnTarget))
        } else {
          cCell.innerHTML = dangerLevel
        }
      }
    })
  }
};

function findNeighborTargets(target, allTargets) {
  /**
    * @desc finds all 8 neighboring cell ids for a given cell id
    * filters non-existing cell ids to count for corners and edges
    * returns a list
  */

  let targetsRow = target.slice(0, 2);  // first two chars represent row
  let targetsColumn = target.slice(2, 4);  // last two chars represent cell

  let possibleNeighbors = [
    plusOne(targetsRow) + minusOne(targetsColumn),
    plusOne(targetsRow) + targetsColumn,
    plusOne(targetsRow) + plusOne(targetsColumn),
    targetsRow + minusOne(targetsColumn),
    targetsRow + plusOne(targetsColumn),
    minusOne(targetsRow) + minusOne(targetsColumn),
    minusOne(targetsRow) + targetsColumn,
    minusOne(targetsRow) + plusOne(targetsColumn),
  ]

  return possibleNeighbors.filter( nTarget => allTargets.includes(nTarget) )
}

function assignDangerLevel(target, targets) {
  let neighborTargets = findNeighborTargets(target, targets.all)
  let neighborMineCount = 0;
  neighborTargets.forEach( nTarget => {
    if (targets.mined.includes(nTarget)) {
      neighborMineCount += 1;
    }
  })
  return neighborMineCount
}

function filterBySafety(neighborTargets, safeTargets) {
  return neighborTargets.filter( nTarget => safeTargets.includes(nTarget) );
}

function endGame(resultId, cells) {
  // resultId should be "game-won" or "game-lost" (matching relevant <section>'s id)
  document.getElementById(resultId).style.display = "block";
  cells.forEach( cell => {
    cell.removeEventListener("click", handleLeftClick);
    cell.removeEventListener("contextmenu", handleRightClick);
  })
}

function revealMines(mines, className) {
  mines.forEach( mine => {
    document.getElementById(mine).className = className
  })
}

function revealSafeCells(targets) {
  targets.safe.forEach( sTarget => {
    let safeCell = document.getElementById(sTarget)
    safeCell.className = "open"
    dangerLevel = assignDangerLevel(safeCell.id, targets)
    if (dangerLevel > 0) { safeCell.innerHTML = dangerLevel }
  })
}

function checkDefeat(target, minedTargets) {
  let defeat = false;
  minedTargets.forEach( mTarget => {
    if (target === mTarget) { defeat = true }
  })
  return defeat
}

function checkVictory(safeTargets) {
  let victory = true
  safeTargets.forEach( sTarget => {
    let cell = document.getElementById(sTarget);
    if (cell.className !== "open") { victory = false }
  })
  return victory
}

function plusOne(numberString) {
  // takes a two-digit-number as string
  // returns a two-digit-number as string
  let number = parseInt(numberString) + 1
  if(number < 10) {
    return "0" + number.toString()
  } else {
    return number.toString()
  }
}

function minusOne(numberString) {
  // takes a two-digit-number as string
  // returns a two-digit-number as string
  let number = parseInt(numberString) - 1
  if(number < 10) {
    return "0" + number.toString()
  } else {
    return number.toString()
  }
}
