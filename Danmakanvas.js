//Extendible Danmaku Simulator & Game Engine
//Version 2.2-dev
//Copyright Andrew Fan 2019

//Danmakanvas.js contains all components that are shared across the system.
//Danmakanvas.js requires perfect and appropriate parameter usage since ES6's Default Parameters are not yet supported by all browsers.
//It requires a module to handle the player
//It requires a script to handle the plural

"use strict"; //Sanity check

//REMINDERS
//JavaScript Objects are MUTABLE (pass by reference) - let x = y will result in both x and y pointing to the same object.
//However, function parameters are passed by value
//Constructors should start in Uppercase. Variables should be in camelCase.
//Variables and Functions are hoisted (they can be used before they are declared)

//Global letiables (use sparingly)
let startedplurals = []; //array containing IDs of all canvases that have already initiated.

//Version number
const VERSION_NUMBER_DANMAKANVAS = "Danmakanvas v2.2-dev";

/* *****
 * void createNewGame(string canvasid)
 * -- Creates a new game
 * Param: canvasid - the string containing the id of the canvas to use. 
 * *****/
function createNewGame(canvasid, title) {
    console.log("createNewGame(): Now Running");
    let newgame = new NewGame(canvasid, title);
    newgame.startGame(canvasid);
}

//Constructor for the object
function NewGame(canvasid, title) {
    this.player = {}; //player
    this.bullets = []; //array containing all bullets
    this.text = []; //array containing all text objects
    this.pluralcontroller = {}; //Current plural running
    this.canvas = document.getElementById(canvasid);
    this.context = this.canvas.getContext("2d");
    this.frameNo = 0;

    this.framereset = true; // Whether or not to run clearCanvas every frame. Disabling allows for showing bullet trails.

    /* *****
     * void startGame(string canvasid)
     * -- Runs the canvas on the given canvas ID
     * Param: canvasid - the string containing the id of the canvas to use. 
     * *****/
    this.startGame = function (canvasid) {
        console.log("startGame(): Running on canvas with id " + canvasid);
        this.resetGame(); //reset the current canvas by purging all elements

        //Obtain the plural controller
        this.pluralcontroller = getPluralController(this, canvasid);
        if (this.pluralcontroller === null) {
            console.log("startGame(): Returned pluralcontroller was null");
        }

        //If the interval has not been started yet, begin it.
        if (!this.contains(startedplurals, canvasid)) {
            console.log("startGame(): Canvas " + canvasid + " has not been started yet. Initializing this.interval for the canvasid");
            startedplurals.push(canvasid);
            this.setupInterval(20);
        }

        // Set up standard text objects
        CreateText(4, 12, "#FFFFFF", 12, "Arial", "left", VERSION_NUMBER_DANMAKANVAS, this);
        CreateText(4, 24, "#FFFFFF", 12, "Arial", "left", title, this);
        this.bulletCountText = CreateText(4, this.canvas.height - 4, "#FFFFFF", 12, "Arial", "left", "Bullet Count: " + (this.bullets.length).toString(), this);
    };

    this.setupInterval = function(updatefreq) {
        setInterval(this.update_main, updatefreq, this); //in milliseconds. Runs update every 20 millis (50 FPS). canvasid is passed to update_main
    };

    //Clear all bullets, etc. Every existing update must terminate.
    this.resetGame = function () {
        this.player = {};
        this.bullets = [];
        this.text = [];
        if (this.pluralcontroller !== undefined && this.pluralcontroller !== null && !this.isEmpty(this.pluralcontroller)) {
            this.pluralcontroller.remove(); //Forcefully garbage collect all ongoing singles and plurals
        }
        this.pluralcontroller = {};
        this.frameNo = 0;
    };

    this.clearCanvas = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    //Main update loop. Calls the update loops of all objects and handles collision.
    //Since it's called in a setInterval, it is necessary to pass the current instance of the game object in as a parameter
    this.update_main = function (currgame) {
        if (currgame.framereset) {
            currgame.clearCanvas(); //Begin by clearing everything
        }
        currgame.frameNo += 1; //Increment the master counter

        currgame.pluralcontroller.update();

        let objtoremove = [];
        let i;
        for (i = 0; i < currgame.bullets.length; i += 1) {
            currgame.bullets[i].update();
            if (!currgame.isinbounds(currgame.bullets[i], currgame.canvas.width, currgame.canvas.height)) {
                objtoremove.push(i);
            } else if (currgame.bullets[i].vanishtime > 0 && currgame.bullets[i].existtime > currgame.bullets[i].vanishtime) {
                objtoremove.push(i);
            }
        }
        for (i = objtoremove.length - 1; i >= 0; i -= 1) {
            currgame.bullets.splice(objtoremove[i], 1);
        }

        // Update metrics reporting
        currgame.bulletCountText.content = "Bullet Count: " + (currgame.bullets.length).toString();

        currgame.draw_main(canvasid); //draw updated things 
    };

    //Main draw loop. Handles render order.
    this.draw_main = function (canvasid) {
        let i;
        for (i = 0; i < this.bullets.length; i += 1) {
            this.bullets[i].draw();
        }
        for (i = 0; i < this.text.length; i += 1) {
            this.text[i].draw();
        }
    };

    //If the current counter (updated every 20 ms) / n % 1 === 0, then return true. Else return false.
    //Ex: If frameNo incremeents every 20 ms (50 FPS), then if n = 2, everyinterval will return true every 40 ms (every 2 frames). 
    //If n = 4, true every 80 ms (every 4 frames) 
    this.everyinterval = function (n) {
        if ((this.frameNo / n) % 1 === 0) {
            return true;
        }
        return false;
    };

    /* **************** Accessory Functions **************** */

    this.isinbounds = function (obj, wd, ht) {
        if (obj.x < -32 || obj.x > wd + 32 || obj.y < -32 || obj.y > ht + 32) {
            return false;
        }
        return true;
    };

    this.toRadians = function (i) {
        return i * (Math.PI/180);
    };

    this.contains = function (a, obj) {
        let i = a.length;
        while (i--) {
           if (a[i] === obj) {
               return true;
           }
        }
        return false;
    };

    this.isEmpty = function (obj) {
        return Object.keys(obj).length === 0;
    };
}

/* **************** Object Constructors **************** */

/* *****
 * obj EnemyShot(float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Constructor for an enemy shot object.
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke radius of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance the bullet belongs to
 * *****/
function EnemyShot(x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.accel = accel;
    this.maxspeed = maxspeed;
    this.color = color;
    this.graphic = "CIRCLE"; // Default, must be manually overridden.
    this.brad = brad;
    this.srad = srad;
    this.srad2 = 0.0; // Used for certain graphic styles
    this.swid = swid;
    this.directed = false; // If true, angles the graphic with the angle of the bullet
    this.rotation = 0; // If nonzero, rotates at the specified angle, overriding directed
    this.graphicangle = 0; // Graphic angle. Tied to rotation and directed.
    this.hitbox = hitbox;
    this.createtime = currgame.frameNo;
    this.existtime = 0;
    this.vanishtime = vanishtime;
    this.update = function () {
        this.baseupdate();
        this.customupdate();
    };
    this.baseupdate = function () {
        this.x += this.speed*Math.cos(this.angle);
        this.y += this.speed*Math.sin(this.angle);
        if (this.accel != 0) { //Only if accelerating
            this.speed = Math.min(this.maxspeed, this.speed + this.accel);
        }
        if (this.directed) {
            this.graphicangle = this.angle;
        }
        if (this.rotation !== 0) {
            this.graphicangle += this.rotation;
        }
        this.existtime += 1;
    };
    this.customupdate = function () {

    };
    this.draw = function () {
        let ctx = currgame.context; //game window
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.brad, 0, 2*Math.PI);
        ctx.fill();

        if (this.graphic == "CIRCLE") { // Default
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.srad, 0, 2*Math.PI);
            ctx.lineWidth = this.swid;
            ctx.stroke();
        } else if (this.graphic == "DIAMOND") {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.srad * Math.cos(this.graphicangle), this.y + this.srad * Math.sin(this.graphicangle));
            ctx.lineTo(this.x + this.srad2 * Math.cos(this.graphicangle + Math.PI/2), this.y + this.srad2 * Math.sin(this.graphicangle + Math.PI/2));
            ctx.lineTo(this.x + this.srad * Math.cos(this.graphicangle + Math.PI), this.y + this.srad * Math.sin(this.graphicangle + Math.PI));
            ctx.lineTo(this.x + this.srad2 * Math.cos(this.graphicangle - Math.PI/2), this.y + this.srad2 * Math.sin(this.graphicangle - Math.PI/2));
            ctx.closePath();
            ctx.lineWidth = this.swid;
            ctx.stroke();
        } else if (this.graphic == "TRIANGLE") {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x + this.srad * Math.cos(this.graphicangle), this.y + this.srad * Math.sin(this.graphicangle));
            ctx.lineTo(this.x + this.srad2 * Math.cos(this.graphicangle + Math.PI*2/3), this.y + this.srad2 * Math.sin(this.graphicangle + Math.PI*2/3));
            ctx.lineTo(this.x + this.srad2 * Math.cos(this.graphicangle + Math.PI*4/3), this.y + this.srad2 * Math.sin(this.graphicangle + Math.PI*4/3));
            ctx.closePath();
            ctx.lineWidth = this.swid;
            ctx.stroke();
        } else if (this.graphic == "OVAL") {
        	// Code Source for ellipse: https://stackoverflow.com/questions/14169234 (PokatilovArt)
            ctx.strokeStyle = this.color;
            let width_two_thirds = this.srad * 4 / 3;

			let dx1 = Math.sin(this.graphicangle) * this.srad2;
			let dy1 = Math.cos(this.graphicangle) * this.srad2;
			let dx2 = Math.cos(this.graphicangle) * width_two_thirds;
			let dy2 = Math.sin(this.graphicangle) * width_two_thirds;

			let topCenterX = this.x - dx1;
			let topCenterY = this.y + dy1;
			let topRightX = topCenterX + dx2;
			let topRightY = topCenterY + dy2;
			let topLeftX = topCenterX - dx2;
			let topLeftY = topCenterY - dy2;

			let bottomCenterX = this.x + dx1;
			let bottomCenterY = this.y - dy1;
			let bottomRightX = bottomCenterX + dx2;
			let bottomRightY = bottomCenterY + dy2;
			let bottomLeftX = bottomCenterX - dx2;
			let bottomLeftY = bottomCenterY - dy2;

			ctx.beginPath();
			ctx.moveTo(bottomCenterX, bottomCenterY);
			ctx.bezierCurveTo(bottomRightX, bottomRightY, topRightX, topRightY, topCenterX, topCenterY);
			ctx.bezierCurveTo(topLeftX, topLeftY, bottomLeftX, bottomLeftY, bottomCenterX, bottomCenterY);
			ctx.closePath();
            ctx.lineWidth = this.swid;
            ctx.stroke();
        } else if (this.graphic == "ARROWHEAD") {
        	// Code adapted from Ellipse (As it is half an ellipse)
        	// Note that we move 1/3 of srad downwards towards the bullet
            ctx.strokeStyle = this.color;
            let width_two_thirds = this.srad * 4 / 3;

			let dx1 = Math.sin(this.graphicangle) * this.srad2;
			let dy1 = Math.cos(this.graphicangle) * this.srad2;
			let dx2 = Math.cos(this.graphicangle) * width_two_thirds;
			let dy2 = Math.sin(this.graphicangle) * width_two_thirds;

			let topCenterX = this.x - dx1 + this.srad/3*Math.cos(this.graphicangle + Math.PI);
			let topCenterY = this.y + dy1 + this.srad/3*Math.sin(this.graphicangle + Math.PI);
			let topRightX = topCenterX + dx2;
			let topRightY = topCenterY + dy2;
			let topLeftX = topCenterX - dx2;
			let topLeftY = topCenterY - dy2;

			let bottomCenterX = this.x + dx1 + this.srad/3*Math.cos(this.graphicangle + Math.PI);
			let bottomCenterY = this.y - dy1 + this.srad/3*Math.sin(this.graphicangle + Math.PI);
			let bottomRightX = bottomCenterX + dx2;
			let bottomRightY = bottomCenterY + dy2;
			let bottomLeftX = bottomCenterX - dx2;
			let bottomLeftY = bottomCenterY - dy2;

			ctx.beginPath();
			ctx.moveTo(bottomCenterX, bottomCenterY);
			ctx.bezierCurveTo(bottomRightX, bottomRightY, topRightX, topRightY, topCenterX, topCenterY);
			
            ctx.lineWidth = this.swid;
            ctx.stroke();
        }
    };
    return this;
}

/* *****
 * obj DMKText(float x, float y, hex/rgb fillStyle, int fontsize, string font, string textAlign, string content, obj currgame)
 * -- Constructor for a Danmakanvas Text object.
 * Param: x, y - the location of the text
 * Param: fillStyle - the color of the text
 * Param: fontsize - the font size of the text
 * Param: font - the font of the text
 * Param: textAlign - the text alignment of the text. Possible values are start, end, left, center, and right
 * Param: content - the content of the text
 * Param: currgame - game/Danmakanvas Instance the bullet belongs to
 * *****/
function DMKText(x, y, fillStyle, fontsize, font, textAlign, content, currgame) {
	this.x = x;
    this.y = y;
    this.fillStyle = fillStyle;
    this.fontsize = fontsize;
    this.font = font;
    this.textAlign = textAlign;
    this.content = content;
    this.createtime = currgame.frameNo;
    this.existtime = 0;
    this.update = function () {
    };
    this.draw = function () {
        let ctx = currgame.context; //game window
        ctx.fillStyle = this.fillStyle;
        ctx.font = "" + this.fontsize + "px " + this.font;
        ctx.textAlign = this.textAlign;
        ctx.fillText(this.content, this.x, this.y);
    };
    return this;
}

/* *****
 * obj Player(float x, float y)
 * -- Constructor for an extendible player object.
 * Param: x, y - the location of the center of the player
 * *****/
function Player(x, y) {
    this.x = x;
    this.y = y;
    //update and draw are defined in the player javascript library
}

/* **************** Danmakanvas Functions **************** */

/* **************** General Functions **************** */

/* *****
 * obj GetCenterX(obj currgame)
 * -- Returns the center x coordinate of the canvas
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function GetCenterX(currgame) {
    return currgame.canvas.width / 2;
}

/* *****
 * obj GetCenterY(obj currgame)
 * -- Returns the center y coordinate of the canvas
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function GetCenterY(currgame) {
    return currgame.canvas.height / 2;
}

/* *****
 * obj DeleteShot(obj bullet, obj currgame)
 * -- Deletes the bullet from the game
 * Param: bullet - EnemyShot object
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function DeleteShot(bullet, currgame) {
    let i = 0;
    for (i = 0; i < currgame.bullets.length; i += 1) {
        if (currgame.bullets[i] === bullet) {
            currgame.bullets.splice(i, 1);
            break;
        }
    }
}

/* **************** Bullet Creation Functions **************** */

/* *****
 * obj CreateShotA1(float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates an enemy shot object. Returns EnemyShot object.
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance the bullet belongs to
 * *****/
function CreateShotA1(x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
    let newshot = new EnemyShot(x, y, speed, angle, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
	currgame.bullets.push(newshot);
	return newshot;
}

/* *****
 * obj CreateShotA2(float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates an enemy shot object. Returns EnemyShot object.
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance the bullet belongs to
 * *****/
function CreateShotA2(x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
    let newshot = new EnemyShot(x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
	currgame.bullets.push(newshot);
	return newshot;
}

/* *****
 * obj[] CreateRingA1(int n, float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates n bullets in a ring and adds them to the current danmakanvas instance. Returns array containing created bullets
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: n - the number of bullets to create
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateRingA1(n, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
	let i = 0;
	let ringbullets = [];
	for (i = 0; i < n; i += 1) {
		let newshot = new EnemyShot(x, y, speed, angle + Math.PI*2/n*i, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
		currgame.bullets.push(newshot);
		ringbullets.push(newshot);
	}
	return ringbullets;
}

/* *****
 * obj[] CreateRingA2(int n, float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates n bullets in a ring and adds them to the current danmakanvas instance. Returns array containing created bullets
 * Param: n - the number of bullets to create
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateRingA2(n, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
	let i = 0;
	let ringbullets = [];
	for (i = 0; i < n; i += 1) {
		let newshot = new EnemyShot(x, y, speed, angle + Math.PI*2/n*i, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
		currgame.bullets.push(newshot);
		ringbullets.push(newshot);
	}
	return ringbullets;
}

/* *****
 * obj[] CreateSpreadA1(int n, float angoffset, float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates an n-way spread centered around the provided angle and adds them to the current danmakanvas instance. Returns array containing created bullets
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: n - the number of bullets to create
 * Param: angoffset - the angle spacing between individual bullets, offset from the given angle
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateSpreadA1(n, angoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
	let i = 0;
	let spreadbullets = [];
	for (i = -(n-1)/2; i < (n-1)/2 + 1; i += 1) {
		let newshot = new EnemyShot(x, y, speed, angle + angoffset*i, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
		currgame.bullets.push(newshot);
		spreadbullets.push(newshot);
	}
	return spreadbullets;
}

/* *****
 * obj[] CreateSpreadA2(int n, float angoffset, float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates an n-way spread centered around the provided angle and adds them to the current danmakanvas instance. Returns array containing created bullets
 * Param: n - the number of bullets to create
 * Param: angoffset - the angle spacing between individual bullets, offset from the given angle
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateSpreadA2(n, angoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
	let i = 0;
	let spreadbullets = [];
	for (i = -(n-1)/2; i < (n-1)/2 + 1; i += 1) {
		let newshot = new EnemyShot(x, y, speed, angle + angoffset*i, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
		currgame.bullets.push(newshot);
		spreadbullets.push(newshot);
	}
	return spreadbullets;
}

/* *****
 * obj[] CreateStackA1(int n, float spdoffset, float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates an n-stack starting from the given speed and adds them to the current danmakanvas instance. Returns array containing created bullets
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: n - the number of bullets to create
 * Param: spdoffset - the speed difference between bullets, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateStackA1(n, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
	let i = 0;
	let stackbullets = [];
	for (i = 0; i < n; i += 1) {
		let newshot = new EnemyShot(x, y, speed + spdoffset*i, angle, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
		currgame.bullets.push(newshot);
		stackbullets.push(newshot);
	}
	return stackbullets;
}

/* *****
 * obj[] CreateStackA2(int n, float spdoffset, float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates an n-stack starting from the given speed and adds them to the current danmakanvas instance. Returns array containing created bullets
 * Param: n - the number of bullets to create
 * Param: spdoffset - the speed difference between bullets, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateStackA2(n, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
	let i = 0;
	let stackbullets = [];
	for (i = 0; i < n; i += 1) {
		let newshot = new EnemyShot(x, y, speed + spdoffset*i, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
		currgame.bullets.push(newshot);
		stackbullets.push(newshot);
	}
	return stackbullets;
}

/* *****
 * obj[] CreateRingStackA1(int n, int m, float spdoffset, float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates an m-stack of n bullets in a ring and adds them to the current danmakanvas instance. Returns array containing created bullets
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: n - the number of bullets to create
 * Param: m - the number of rings in the stack
 * Param: spdoffset - the speed difference between rings, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateRingStackA1(n, m, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
	let i = 0;
	let j = 0;
	let ringbullets = [];
	for (i = 0; i < n; i += 1) {
		for (j = 0; j < m; j += 1) {
			let newshot = new EnemyShot(x, y, speed + spdoffset*j, angle + Math.PI*2/n*i, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
            currgame.bullets.push(newshot);
			ringbullets.push(newshot);
		}
	}
	return ringbullets;
}

/* *****
 * obj[] CreateRingStackA2(int n, int m, float spdoffset, float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates an m-stack of n bullets in a ring and adds them to the current danmakanvas instance. Returns array containing created bullets
 * Param: n - the number of bullets to create
 * Param: m - the number of rings in the stack
 * Param: spdoffset - the speed difference between rings, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateRingStackA2(n, m, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
	let i = 0;
	let j = 0;
	let ringbullets = [];
	for (i = 0; i < n; i += 1) {
		for (j = 0; j < m; j += 1) {
			let newshot = new EnemyShot(x, y, speed + spdoffset*j, angle + Math.PI*2/n*i, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
            currgame.bullets.push(newshot);
			ringbullets.push(newshot);
		}
	}
	return ringbullets;
}

/* *****
 * obj[] CreateSpreadStackA1(int n, int m, float angoffset, float spdoffset, float x, float y, float speed, float angle, hex/rgb color, float brad, float srad, float swid, int hitbox, obj currgame)
 * -- Creates an n-way m-stack centered around the provided angle and adds them to the current danmakanvas instance. Returns array containing created bullets
 * -- A1 option sets speed and acceleration to 0 and sets vanishtime to -1 (deletion only when out of bounds)
 * Param: n - the number of bullets to create
 * Param: m - the number of rings in the stack
 * Param: angoffset - the angle spacing between individual bullets, offset from the given angle
 * Param: spdoffset - the speed difference between spread waves, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateSpreadStackA1(n, m, angoffset, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame) {
	let i = 0;
	let j = 0;
	let spreadbullets = [];
	for (i = -(n-1)/2; i < (n-1)/2 + 1; i += 1) {
		for (j = 0; j < m; j += 1) {
			let newshot = new EnemyShot(x, y, speed + spdoffset*j, angle + angoffset*i, 0, 0, color, brad, srad, swid, hitbox, -1, currgame);
			currgame.bullets.push(newshot);
			spreadbullets.push(newshot);
		}
	}
	return spreadbullets;
}

/* *****
 * obj[] CreateSpreadStackA2(int n, int m, float angoffset, float spdoffset, float x, float y, float speed, float angle, float accel, float maxspeed, hex/rgb color, float brad, float srad, float swid, int hitbox, int vanishtime, obj currgame)
 * -- Creates an n-way m-stack centered around the provided angle and adds them to the current danmakanvas instance. Returns array containing created bullets
 * Param: n - the number of bullets to create
 * Param: m - the number of rings in the stack
 * Param: angoffset - the angle spacing between individual bullets, offset from the given angle
 * Param: spdoffset - the speed difference between spread waves, offset from the given speed
 * Param: x, y - the location of the center of the bullet
 * Param: speed, angle - the speed and angle (radians) of the bullet
 * Param: accel, maxspeed - the acceleration and maximum speed of the bullet
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: swid - the stroke width of the bullet graphic
 * Param: hitbox - the radius of the bullet hitbox
 * Param: vanishtime - if greater than 0, the duration before the bullet is deleted
 * Param: currgame - game/Danmakanvas Instance
 * *****/
function CreateSpreadStackA2(n, m, angoffset, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame) {
	let i = 0;
	let j = 0;
	let spreadbullets = [];
	for (i = -(n-1)/2; i < (n-1)/2 + 1; i += 1) {
		for (j = 0; j < m; j += 1) {
			let newshot = new EnemyShot(x, y, speed + spdoffset*j, angle + angoffset*i, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame);
			currgame.bullets.push(newshot);
			spreadbullets.push(newshot);
		}
	}
	return spreadbullets;
}

/* **************** Object Functions **************** */

/* *****
 * obj SetShotGraphic(obj shot, string graphic, hex/rgb color, float brad, float srad, float swid, float swid2, bool directed, float rotation)
 * -- Sets the graphic of a given shot
 * Param: shot - the shot to apply changes to
 * Param: graphic - the graphic type to use for this shot. Must be from predefined list.
 * Param: color - the HTML representation of the bullet's outer stroke color.
 * Param: brad, srad - the radius of the bullet graphic and the radius of the bullet stroke
 * Param: srad2 - the second stroke radius of the bullet graphic, used for stretching non-radial bullets. Set to 0 for CIRCLE
 * Param: swid - the stroke width of the bullet graphic
 * Param: directed - whether or not the bullet's rotation angle is set to its movement angle
 * Param: rotation - rotation per frame, in radians. Set to 0 if the bullet should not rotate.
 * *****/
function SetShotGraphic(shot, graphic, color, brad, srad, srad2, swid, directed, rotation) {
    shot.graphic = graphic;
    shot.color = color;
    shot.brad = brad;
    shot.srad = srad;
    shot.srad2 = srad2;
    shot.swid = swid;
    shot.directed = directed;
    shot.rotation = rotation;
}

/* *****
 * obj CreateText(float x, float y, hex/rgb fillStyle, int fontsize, string font, string textAlign, string content, obj currgame)
 * -- Creates a text object and adds it to the current danmakanvas instance. Returns created Danmakanvas Text Object
 * Param: x, y - the location of the text
 * Param: fillStyle - the color of the text
 * Param: fontsize - the font size of the text
 * Param: font - the font of the text
 * Param: textAlign - the text alignment of the text. Possible values are start, end, left, center, and right
 * Param: content - the content of the text
 * Param: currgame - game/Danmakanvas Instance the bullet belongs to
 * *****/
function CreateText(x, y, fillStyle, fontsize, font, textAlign, content, currgame) {
	let newtext = new DMKText(x, y, fillStyle, fontsize, font, textAlign, content, currgame);
	currgame.text.push(newtext);
	return newtext;
}
