/******************************************************************************/
/***************************   GAME SETUP   ***********************************/
/******************************************************************************/
let COLUMN_NO = 16;
let ROW_NO = 16;
let MINE_NO = 25;

document.addEventListener("DOMContentLoaded", () => {
  let board = initializeBoard(COLUMN_NO, ROW_NO);
  let cells = board.querySelectorAll("td");
  let allTargets = getAllTargets(cells);
  let minedTargets = placeMines(allTargets, MINE_NO);
  let safeTargets = findSafeTargets(allTargets, minedTargets)
  let targets = {
    all: allTargets,
    mined: minedTargets,
    safe: safeTargets,
  }
  // assing dangerLevel to cells according to their neighboring mines
  cells.forEach( cell => {
    // cell.className = assignDangerLevel(cell);
    cell.addEventListener("click", () => {
      handleCellClick(cell, targets)
    });
    cell.addEventListener("contextmenu", markCell);
  })
});

/******************************************************************************/
/*************************   MAIN FUNCTIONS   *********************************/
/******************************************************************************/

function initializeBoard(desiredRowNo, desiredColumnNo) {
  let board = document.createElement("table");
  for (let rowNo = 1; rowNo <= desiredRowNo; rowNo++) {
    let row = document.createElement("tr");
    for (let columnNo = 1; columnNo <= desiredColumnNo; columnNo++) {
      let cell = document.createElement("td");
      cell.id = makeTwoDigitStrings(rowNo) + makeTwoDigitStrings(columnNo); // e.g., "0742"
      row.append(cell);
    }
    board.append(row);
  }
  document.querySelector(".board-wrapper").append(board);
  return board
}

function getAllTargets(squares) {
  let allTargets = [];
  squares.forEach( square => {
    allTargets.push(square.id)
  })
  return allTargets
}

function placeMines(targets, desiredMineNo) {
  let allMines = [];
  for(let i = 0; i < desiredMineNo; i++) {
    let mine = targets[Math.floor(Math.random() * targets.length)];
    while(allMines.includes(mine)) {  // checks if the target already mined
      mine = targets[Math.floor(Math.random() * targets.length)];
    }
    allMines.push(mine);
  }
  return allMines
}

function findSafeTargets(allTargets, minedTargets) {
  let safeTargets = []
  allTargets.forEach( target => {
    if (!minedTargets.includes(target)) {
      safeTargets.push(target)
    }
  })
  return safeTargets
}

function handleCellClick(cell, targets) {
  revealCellContent(cell, targets)
  let defeat = checkDefeat(cell.id, targets.mined)
  if(defeat){
    revealMines(targets.mined, "mine-exploded")
    revealSafeCells(targets)
    document.querySelector(".game-lost").style.display = "block";
  } else {
    let victory = checkVictory(targets.safe)
    if (victory) {
        revealMines(targets.mined, "mine-avoided");
        document.querySelector(".game-won").style.display = "block";
    }
  }
};

function markCell(e) {
  if(e.target.className !== "open") {
    e.target.className = "marked";
  }
}

/******************************************************************************/
/***********************   HELPER FUNCTIONS   *********************************/
/******************************************************************************/

function findNeighborTargets(target, allTargets) {
  // target is a stringID; first two index represent row, last two represent cell
  let targetsRow = target.slice(0, 2);
  let targetsColumn = target.slice(2, 4);

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

  let actualNeighbors = possibleNeighbors.filter( nTarget => allTargets.includes(nTarget) );
  return actualNeighbors
}

function assignDangerLevel(target, targets) {
  let neighborTargets = findNeighborTargets(target, targets.all)
  let neighborMineCount = 0;
  neighborTargets.forEach( nTarget => {
    if(targets.mined.includes(nTarget)) {
      neighborMineCount += 1;
    }
  })
  return neighborMineCount
}

function revealCellContent(cell, targets) {
  let dangerLevel = assignDangerLevel(cell.id, targets);
  if(dangerLevel === 0) {
    // if cell's neighbors are empty, chain-open neighbor cells
    cell.className = "open";
    chainOpenNeighbors(cell, targets);
  } else {
    cell.innerHTML = dangerLevel
    cell.className = "open";
  }
};

function revealMines(mines, className) {
  mines.forEach( mine => {
    let minedCell = document.getElementById(mine)
    minedCell.className = className;
  })
}

function revealSafeCells(targets) {
  targets.safe.forEach( sTarget => {
    let safeCell = document.getElementById(sTarget)
    safeCell.className = "open"
    dangerLevel = assignDangerLevel(safeCell.id, targets)
    if(dangerLevel > 0) { safeCell.innerHTML = dangerLevel }
  })
}

function checkDefeat(target, minedTargets) {
  let defeat = false;
  minedTargets.forEach( mTarget => {
    if( target === mTarget ) { defeat = true }
  })
  return defeat
}

function checkVictory(safeTargets) {
  let victory = true
  safeTargets.forEach( sTarget => {
    let cell = document.getElementById(sTarget);
    if(cell.className !== "open") {
      victory = false
    }
  })
  return victory
}

function filterNeighborTargetsBySafety(neighborTargets, safeTargets) {
  return neighborTargets.filter( nTarget => safeTargets.includes(nTarget) );
}

function chainOpenNeighbors(cell, targets) {
  /* keeps opening the neighboring cells until it reaches
  dangerous cells/mines in all sides */
  let neighborTargets = findNeighborTargets(cell.id, targets.all);
  safeNeighborTargets = filterNeighborTargetsBySafety(neighborTargets, targets.safe)

  let targetSetToCheck = new Set(safeNeighborTargets)
  while( targetSetToCheck.size > 0 ) {
    let currentTargetLoop = [...targetSetToCheck.values()].sort()
    currentTargetLoop.forEach( cTarget => {
      let cCell = document.getElementById(cTarget)
      targetSetToCheck.delete(cTarget)

      if(cCell.className !== "open") {
        cCell.className = "open"
        let dangerLevel = assignDangerLevel(cTarget, targets);
        if(dangerLevel === 0) {
          let newNeighborTargets = findNeighborTargets(cTarget, targets.all);
          let newsafeNeighborTargets = filterNeighborTargetsBySafety(newNeighborTargets, targets.safe);
          newsafeNeighborTargets.forEach( nsnTarget => targetSetToCheck.add(nsnTarget))
        } else {
          cCell.innerHTML = dangerLevel
        }
      }
    })
  }
};

function makeTwoDigitStrings(number) {
  if (number < 10) {
    return "0" + number.toString()
  } else {
    return number.toString()
  }
};

function plusOne(numberString) {
  // takes a two-digit-number as string, returns a two-digit-number as string
  let number = parseInt(numberString) + 1
  if(number < 10) {
    return "0" + number.toString()
  } else {
    return number.toString()
  }
}

function minusOne(numberString) {
  // takes a two-digit-number as string, returns a two-digit-number as string
  let number = parseInt(numberString) - 1
  if(number < 10) {
    return "0" + number.toString()
  } else {
    return number.toString()
  }
}
