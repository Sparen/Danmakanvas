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
    this.tasks.push(new Single_1_Task_SpreadShot(currgame));
    let currdir = 1;
    this.update = function () { // Main Loop for a given Danmakanvas Instance
        if (currgame.everyinterval(50)) { 
            let bullets = CreateRingStackA2(20, 5, 0.1, GetCenterX(currgame), GetCenterY(currgame), 0, Math.random() * Math.PI*2, 0.01, 12, "#FF00FF", 2, 3, 0.5, 1, -1, currgame);
            let objctr = 0;
            for (objctr = 0; objctr < bullets.length; objctr += 1) {
                let currbullet = bullets[objctr];
                let angvel = 0.01 * currdir;
                currbullet.customupdate = function() {applywvel(currbullet, angvel);}
                // WARNING: You CANNOT use `bullets[objctr].customupdate = function() {applywvel(bullets[objctr], 0.01 * currdir);}`
                // Experiment: What happens if `0.01 * currdir`` directly in the applywvel function? (see below)
                //currbullet.customupdate = function() {applywvel(currbullet, 0.01 * currdir);}
                // This behavior is because the function will refer to the current state of the currdir variable, which changes over time
            }
            currdir *= -1; // Flip angular velocity direction each time
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

function Single_1_Task_SpreadShot(currgame) {
    this.counter = 0;
    this.maxcounter = -1; // Maximum time allowed for task to run. Use -1 for non-terminating tasks
    this.finished = false;
    let currangle = 0;
    this.update = function () {
        if (currgame.everyinterval(12)) { 
            let dx = 60*Math.cos(currangle);
            let dy = 60*Math.sin(currangle);
            CreateSpreadStackA1(3, 5, Math.PI/12, 0.5, GetCenterX(currgame) + dx, GetCenterY(currgame) + dy, 2, currangle, "#0066FF", 4, 6, 1, 1, currgame);
            CreateStackA1(5, 0.25, GetCenterX(currgame), GetCenterY(currgame), 3, currangle + Math.PI/2, "#FFFF00", 5, 7, 1, 1, currgame);
            CreateSpreadStackA1(3, 5, Math.PI/12, 0.5, GetCenterX(currgame) - dx, GetCenterY(currgame) - dy, 2, currangle + Math.PI, "#0066FF", 4, 6, 1, 1, currgame);
            CreateStackA1(5, 0.25, GetCenterX(currgame), GetCenterY(currgame), 3, currangle - Math.PI/2, "#FFFF00", 5, 7, 1, 1, currgame);
            currangle += Math.PI*2/7; // Divide by a prime number to ensure that bullets don't spawn in same locations for a long time
        }

        this.counter += 1;
        if (this.counter === this.maxcounter) {
            this.finished = true;
        }
    }
    this.remove = function () { // Deconstructor. Called by the Single object. Destroy any subtasks or objects created by the task here.
    }
}

// Function telling the target to increment its angle by wvel every frame. WARNING: Angular velocity is in radians!
function applywvel(target, wvel) {
    target.angle += wvel;
}
