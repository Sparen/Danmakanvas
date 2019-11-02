//Plural Module - Example - Interval

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
    let j = 1;
    for (j = 1; j < 50; j += 1) {
        this.tasks.push(new Single_1_Task_Interval(currgame, j));
    }
    this.update = function () { // Main Loop for a given Danmakanvas Instance
        // In update, push tasks that run every x frames
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

function Single_1_Task_Interval(currgame, interval) {
    this.counter = 0;
    this.maxcounter = -1; // Maximum time allowed for task to run. Use -1 for non-terminating tasks
    this.finished = false;
    this.update = function () {
        if (currgame.everyinterval(interval)) { 
            var newshot = new EnemyShot(640/51/2 + 640/51*interval, 32, 3, Math.PI/2, 0, 5, "rgb(" + (Math.sin(interval)*255) + "," + (Math.cos(interval)*255) + "," + (Math.sin(interval*2)*255) + ")", 3, 5, 0.75, 4, -1, currgame);
            currgame.bullets.push(newshot);
        }

        this.counter += 1;
        if (this.counter === this.maxcounter) {
            this.finished = true;
        }
    }
    this.remove = function () { // Deconstructor. Called by the Single object. Destroy any subtasks or objects created by the task here.
    }
}