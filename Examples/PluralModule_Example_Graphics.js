//Plural Module - Example - Graphics

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
    let currdir = 1;
    this.update = function () { // Main Loop for a given Danmakanvas Instance
        if (currgame.everyinterval(50)) { 
            let randangle = Math.random() * Math.PI*2;
            let bullets = CreateRingStackA2(20, 3, 0.2, GetCenterX(currgame), GetCenterY(currgame), 0, randangle, 0.01, 12, "#FF00FF", 2, 3, 1, 1, -1, currgame);
            let objctr = 0;
            for (objctr = 0; objctr < bullets.length; objctr += 1) {
                let currbullet = bullets[objctr];
                SetShotGraphic(currbullet, "DIAMOND", "#FF00FF", 1, 4, 8, 1, true, 0);
                currbullet.customupdate = function() {applywvel(currbullet, 0.05 * currdir);}
            }
            let bullets2 = CreateRingStackA2(20, 2, 0.2, GetCenterX(currgame), GetCenterY(currgame), 0.1, randangle, 0.01, 12, "#00FFFF", 2, 3, 1, 1, -1, currgame);
            let objctr2 = 0;
            for (objctr2 = 0; objctr2 < bullets2.length; objctr2 += 1) {
                let currbullet = bullets2[objctr2];
                SetShotGraphic(currbullet, "DIAMOND", "#00FFFF", 1, 6, 6, 1, true, 0);
                currbullet.customupdate = function() {applywvel(currbullet, 0.05 * currdir);}
            }
            let bullets3 = CreateRingStackA2(3, 12, 0.1, GetCenterX(currgame), GetCenterY(currgame), 2, randangle, 0.01, 12, "#FFFF00", 2, 3, 1, 1, -1, currgame);
            let objctr3 = 0;
            for (objctr3 = 0; objctr3 < bullets3.length; objctr3 += 1) {
                let currbullet = bullets3[objctr3];
                SetShotGraphic(currbullet, "DIAMOND", "#FFFF00", 1, 6, 6, 1, false, 0.05);
                let angvel = 0.015 * currdir;
                currbullet.customupdate = function() {applywvel(currbullet, angvel);}
            }
            let bullets4 = CreateRingStackA2(3, 12, 0.1, GetCenterX(currgame), GetCenterY(currgame), 2, randangle, 0.01, 12, "#FF8800", 2, 3, 1, 1, -1, currgame);
            let objctr4 = 0;
            for (objctr4 = 0; objctr4 < bullets4.length; objctr4 += 1) {
                let currbullet = bullets4[objctr4];
                SetShotGraphic(currbullet, "DIAMOND", "#FF8800", 1, 6, 6, 1, false, -0.05);
                let angvel = -0.015 * currdir;
                currbullet.customupdate = function() {applywvel(currbullet, angvel);}
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

// Function telling the target to increment its angle by wvel every frame. WARNING: Angular velocity is in radians!
function applywvel(target, wvel) {
    target.angle += wvel;
}
