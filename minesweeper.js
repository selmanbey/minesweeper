document.addEventListener("DOMContentLoaded", function() {
    
     /********************************************************
     
                            FUNCTIONS
     
     *********************************************************/

    function getAllIDs() {
    // Creates and returns a list containing all the IDs for all the cells
        let allIDs = []
        for(let i = 1; i < 16; i++) {
            if (i < 10) {
                for (let j = 1; j < 16; j++) {
                    if (j < 10) {
                        allIDs.push("0" + String(i) + "0" + String(j))
                    } else {
                        allIDs.push("0" + String(i) + String(j))
                    }
                }
                
            } else {
                for (let j = 1; j < 16; j++) {
                    if (j < 10) {
                        allIDs.push(String(i) + "0" + String(j))
                    } else {
                        allIDs.push(String(i) + String(j))
                    }
                }
            }
        }
        return allIDs
    }

    function findSafeCells(cells, mines) {
    // Creates and returns a list containing the IDs of cells with no mines
        let safeCells = []
        cells.forEach(function(element){
            if (mines.indexOf(element) === -1) {
                safeCells.push(element)
            }
        })
        return safeCells
    }

    function randomizer() {
    // Creates a random ID to pick a random cell to place a mine
        function addZeroOrNot(){
            let a = Math.round(Math.random() * 15);
            while (a === 0) {
                a = Math.round(Math.random() * 15);
            }
            if (a < 10) {
                return String(0) + String(a);
            } else {
                return String(a);
            };
        }

        let x = addZeroOrNot();
        let y = addZeroOrNot();
        
        let randomStringId = x + y;
        
        return randomStringId;
    }

    function placeMines(numberofMines) {
    // Takes an integer as an argument (how many mines should be in the game) 
    // Places the given number of mines in the game
        let mineTracker = []
        for (let i = 0; i < numberofMines; i++) {
            let mineID = randomizer();
            mineTracker.push(mineID);
        }
        return mineTracker;
    }

    function findSurroundingCells(stringID) {
    // Takes a cell ID as an argument
    // Returns its neighbor cells' IDs as a list
        let surroundingCells = [];
        let n = parseInt(stringID);  // numberID

        if (stringID[0] === "0" && stringID[1] === "1") {
            if (n - 1 === "100") {
                //pass
            } else {
                let temporaryList = [];  
                temporaryList.push(String(n + 1), String(n - 1), String(n + 100), String(n + 99), 
                                   String(n + 101));
                temporaryList.forEach(function(element) {
                    surroundingCells.push("0" + element)
                })
            }      
        } else if (stringID[0] === "0" && stringID[1] === "9") {
            surroundingCells.push("0" + String(n + 1), "0" + String(n - 1), "0" + String(n - 100), 
                                  "0" + String(n - 99), "0" + String(n - 101), String(n + 100), 
                                  String(n + 99), String(n + 101));
        } else if (stringID[0] === "1" && stringID[1] === "0") {
            surroundingCells.push(String(n + 1), String(n - 1), "0" + String(n - 100), "0" + 
                                  String(n - 99), "0" + String(n - 101), String(n + 100), 
                                  String(n + 99), String(n + 101));
        } else if (stringID[0] === "0") { 
            let temporaryList = [];  
            temporaryList.push(String(n + 1), String(n - 1), String(n - 100), String(n - 99), 
                               String(n - 101), String(n + 100), String(n + 99), String(n + 101));
            temporaryList.forEach(function(element) {
                surroundingCells.push("0" + element)
            })
        } else if (stringID[0] === "1" && stringID[1] === "5") {
            surroundingCells.push(String(n + 1), String(n - 1), String(n - 100), String(n - 99), 
                                  String(n - 101));
        } else {
            surroundingCells.push(String(n + 1), String(n - 1), String(n - 100), String(n - 99), 
                                  String(n - 101), String(n + 100), String(n + 99), String(n + 101));
        };

        finalList = []
        surroundingCells.forEach(function(element) {
            if (element[2] === "1" && element[3] === "6") {
                //pass
            } else if (element[2] === "0" && element[3] === "0") {
                //pass
            } else {
                finalList.push(element)
            }
        });

        return finalList
    }

    function getNumbered(stringID) {
    // Takes a cell ID as an argument
    // Finds how many mines are there in its neighbouring cells
    // Gives the cell a class:
    // ("empty": no mines around; "mine": cell itself is mine; number(1-8): number of mines around)
        let surroundingCells = findSurroundingCells(stringID);;

        var howManyMinesAround = 0
        surroundingCells.forEach(function(element){
            if (mineTracker.indexOf(element) !== -1) {
                howManyMinesAround += 1;
            };
        })
        
        cell = document.getElementById(stringID)
        if (howManyMinesAround === 0) {    
            if(mineTracker.indexOf(stringID) === -1) {
                cell.className = "empty"
            } else {
                cell.className = "mine"
            }    
        } else {
            if(mineTracker.indexOf(stringID) === -1) {
                cell.className = String(howManyMinesAround);
            } else {
                cell.className = "mine"
            }
        };
    };

    function getGameWonScreen(mines) {
    // Takes the list of all mine IDs in the game
    // Colors all of them green
        mines.forEach(function(element){
            let minedCell = document.getElementById(element)
            minedCell.style.cssText = "background-color: #55895a";
        })
    }

    function getGameLostScreen(mines, safes) {
    // Takes two lists: One for mine IDs, the other for the ID's of the rest of the cells
    // Opens all the cells (as if all of them has been clicked)
    // Colors all mines black
    // Displays all the numbered cells with number
    // Leaves empty cells empty
        mines.forEach(function (element) {
            document.getElementById(element).style.cssText = "background-color: #000000";
        })
        safes.forEach(function(element) {
            let cell = document.getElementById(element)
            if (cell.className === "empty") {
                cell.innerHTML = ""
            } else {
                if (cell.className === "open") {
                    //pass
                } else {
                    cell.innerHTML = cell.className;
                }
            }     
            cell.style.cssText = "background-color: #bed0f4";
        })
        document.querySelector(".gamelost").style.cssText = "display: block";
    }

    function openCell(stringID) {   
    // Takes a cell ID as an argument
    // Reveals its content to the player (empty, number or mine)
    // Marks the cell as opened in the background (by changing its class to "opened")
    // If the cell contains a mine ends the game
        let cell = document.getElementById(stringID)
        if (mineTracker.indexOf(stringID) === -1) {
            if (cell.className === "empty") {
                cell.style.cssText = "background-color: #bed0f4";
                cell.className = "open";
                openMultipleCellsAround(stringID)
            } else {
                if (cell.className === "open") {
                    //pass
                } else {
                    cell.innerHTML = cell.className;
                    cell.style.cssText = "background-color: #bed0f4";
                    cell.className = "open";
                }
            }
        } else {
            cell.style.cssText = "background-color: #000000";
            getGameLostScreen(mineTracker, safeCells); 
        };
    };

    function chooseCell(){
    // Gets the ID of the clicked cell
    // Checks if all the safe cells are opened and declares victory if they are
        let cellID = this.id;
        openCell(cellID)
        let gamestatus = false;
        gamestatus = isGameWon();
        if (gamestatus) {
            getGameWonScreen(mineTracker);
            document.querySelector(".gamewon").style.cssText = "display: block";
        }
    };

    function markCell(event) {
    // Gets the class of the clicked cell
    // Changes its color (as "marked") to indicate player's guess that there is a mine under it
        event.preventDefault();
        if (this.className !== "open") {
            this.style.cssText = "background-color: #900C3F";
        }
    };

    function openMultipleCellsAround(stringID) {
    // Takes a cell ID as an argument
    // Keeps opening the surrounding cells of the surrounding cells until all the neighbouring
    // empty cells are opened
        var continueCondition = 1;
        var centralCell = stringID;
        var surroundingCells = findSurroundingCells(centralCell)
        var checkList = []
        var indexNumber = 0;
        var possibleNumbers = ["1", "2", "3", "4", "5", "6"]
        while (continueCondition > 0) {
            surroundingCells.forEach(function(element) {
                cell = document.getElementById(element)
                if (mineTracker.indexOf(element) === -1 && 
                cell.className !== "open" &&
                cell.className === "empty") {
                    cell.style.cssText = "background-color: #bed0f4";
                    cell.className = "open";
                    checkList.push(element)
                } else if (mineTracker.indexOf(element) === -1 &&
                possibleNumbers.indexOf(cell.className) !== -1) {
                    cell.innerHTML = cell.className;
                    cell.style.cssText = "background-color: #bed0f4";
                    cell.className = "open";
                }; 
            });
            centralCell = checkList[indexNumber];
            if (indexNumber === checkList.length) {
                continueCondition = 0;
            } else {
                surroundingCells = findSurroundingCells(centralCell)
                indexNumber += 1;
            }   
        };
    }

    function isGameWon() {
    // Checks if all the cells are opened or not
    // Declares victory if they are
        let allCells = []
        safeCells.forEach(function(element) {
            let cell = document.getElementById(element);
            if (cell.className !== "open") {
                allCells.push("false")
            }
        })
        if (allCells.indexOf('false') !== -1) {
            return false
        } else {
            return true
        }
    }


    /********************************************************
     
                            GAME SETUP
     
     *********************************************************/


    var cells = document.querySelectorAll("td");
    
    var mineTracker = placeMines(4);
    var allCells = getAllIDs();
    var safeCells = findSafeCells(allCells, mineTracker);
    allCells.forEach(function(element){
        getNumbered(element);
    })

    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener("click", chooseCell);
        cells[i].addEventListener("contextmenu", markCell);
    };

}); 