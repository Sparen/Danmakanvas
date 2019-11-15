//Plural Module - Example - Aimed

"use strict";

// Controller that determines which attacks to display
function getPluralController(currgame, canvasid) {
    switch(canvasid) {
        case "gamecanvas_1":
            return new Plural_1(currgame);
            break;
        default:
            console.log("getPluralController(): Canvas ID " + canvasid + " could not be recognized. Please check to make sure that the canvas ID is correct and/or supported.");
    }
}

// Constructor for a Plural
function Plural_1(currgame) {
    this.step = 0; // Default to first single in array
    this.singles = [new Single_1(currgame)];
    this.update = function () {
        this.singles[this.step].update();
    }
    this.remove = function () {
        this.singles = [];
    }
}

// Constructor for a Single
function Single_1(currgame) {
    this.tasks = [];
    // Push Main Tasks here:
    let angleT = 0;
    let mainshot = CreateShotA1(GetCenterX(currgame) + 160*Math.cos(angleT), GetCenterY(currgame) + 120*Math.sin(angleT), 0, 0, "#FF0000", 8, 12, 2, 0, currgame);
    let disttext = CreateText(4, 40, "white", "12px", "Arial", "left", "", currgame);
    this.update = function () { // Main Loop for a given Danmakanvas Instance
        mainshot.x = GetCenterX(currgame) + 160*Math.cos(angleT);
        mainshot.y = GetCenterY(currgame) + 120*Math.sin(angleT);
        disttext.content = "Distance: " + GetDistanceCoordObj(GetCenterX(currgame), GetCenterY(currgame), mainshot);
        if (currgame.everyinterval(10)) {
            let currangle = GetAngleCoordObj(GetCenterX(currgame), GetCenterY(currgame), mainshot);
            CreateRingStackA1(8, 5, 0.2, GetCenterX(currgame), GetCenterY(currgame), 6, currangle, "#00FFFF", 4, 6, 1, 0, currgame);
        }
        angleT += 0.02;
        // Remove completed tasks
        let tasktoremove = [];
        let i;
        for (i = 0; i < this.tasks.length; i += 1) {
            this.tasks[i].update();
            if (this.tasks[i].finished) {
                tasktoremove.push(i);
                this.tasks[i].remove();
            }
        }
        for (i = tasktoremove.length - 1; i >= 0; i -= 1) {
            this.tasks.splice(tasktoremove[i], 1);
        }
    }
    this.remove = function () {
        this.tasks = [];
    }
}

// Function telling the target to increment its angle by wvel every frame. WARNING: Angular velocity is in radians!
function applywvel(target, wvel) {
    target.angle += wvel;
}
