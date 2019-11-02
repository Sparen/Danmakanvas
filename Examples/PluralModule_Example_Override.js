//Plural Module - Example - Override

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
    this.tasks.push(new Single_1_Task_AngularVelocity(currgame));
    this.update = function () { // Main Loop for a given Danmakanvas Instance
        // In update, push tasks that run every x frames
        if (currgame.everyinterval(50)) { 
            this.tasks.push(new Single_1_Task_Arrows(currgame));
        }
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

function Single_1_Task_AngularVelocity(currgame) {
    this.counter = 0;
    this.maxcounter = -1; // Maximum time allowed for task to run. Use -1 for non-terminating tasks
    this.finished = false;
    let attackcounter = 0;
    this.update = function () {
        if (currgame.everyinterval(4)) { 
            let i = 0;
            if (attackcounter % 2 == 0) {
                for (i = 0; i < 30; i += 1) {
                    let newshot = new EnemyShot(320, 240, 3, Math.PI*2/30*i, 0, 5, "#00FFFF", 2, 4, 0.5, 4, -1, currgame);
                    newshot.customupdate = function() {applywvel(newshot, 0.01);}
                    currgame.bullets.push(newshot);
                }
                attackcounter += 1;
            } else {
                for (i = 0; i < 30; i += 1) {
                    let newshot = new EnemyShot(320, 240, 3, Math.PI*2/30*i, 0, 5, "#FF00FF", 2, 4, 0.5, 4, -1, currgame);
                    newshot.customupdate = function() {applywvel(newshot, -0.01);}
                    currgame.bullets.push(newshot);
                }
                attackcounter += 1;
            }
        }

        this.counter += 1;
        if (this.counter === this.maxcounter) {
            this.finished = true;
        }
    }
    this.remove = function () { // Deconstructor. Called by the Single object. Destroy any subtasks or objects created by the task here.
    }
}

// Function telling the target to zigzag by dt every f frames
function applyzigzag(target, f, dt) {
    if (target.existtime % (2*f) == 0) {
        target.angle += dt;
    }
    if (target.existtime % (2*f) == f) {
        target.angle -= dt;
    }
}

function Single_1_Task_Arrows(currgame) {
    this.counter = 0;
    this.maxcounter = 25; // Maximum time allowed for task to run. Use -1 for non-terminating tasks
    this.finished = false;
    let initangle = Math.random() * Math.PI*2;
    this.update = function () {
        let i = 0;
        for (i = 0; i < 8; i += 1) {
            let newshot = new EnemyShot(320, 240, 3, initangle + Math.PI*2/8*i, 0, 5, "#FFFF00", 2, 4, 0.5, 4, -1, currgame);
            newshot.customupdate = function() {applyzigzag(newshot, 15, Math.PI/3);}
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