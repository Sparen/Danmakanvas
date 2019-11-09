# Danmakanvas

## What is Danmakanvas?

Danmakanvas is a lightweight danmaku engine built in JavaScript (for HTML5 Canvas) that can be embedded into webpages to provide visual examples of danmaku patterns. It provides functionality for creating basic bullets, as well as simulated tasks, and is primarily developed for the sake of allowing cross-platform (Except *cough* INTERNET EXPLORER *cough*) Danmaku prototyping and visualization.

Danmakanvas was first written May-June 2016 (v1) and was, to be frank, OK at best, with a plethora of SetInterval problems and limited usage. However, in January 2018, this old project was slightly rewritten and added to this website (v2) in a form that was usable... if there was only one canvas per page. In April-May 2018, Danmakanvas was rewritten to allow for multiple canvases on the same webpage.

This repository serves as a home for the repository for development on v2.2 onwards so that it is not forcibly coupled to sparen.github.io's repo and also to provide documentation on usage.

## Limitations

Due to the nature of this project having shifted to pattern prototyping, there is currently no support for custom graphics, player scripts, multiple attacks in a row, sound, etc. 

This project is currently not accepting contributions in the form of code. If bugs are encountered, please post an Issue here on GitHub.

## Components

To run Danmakanvas, you must have an HTML source file. This source file must contain a canvas with an ID, height, and width. Note that the actual engine does NOT know the height and width of the canvas. The HTML source must include two scripts - the engine, and what I call a 'PluralModule'. Further details will be provided below.

### The Game Engine

The game engine contains two control functions - `createNewGame(canvasid, title)` and `NewGame(canvasid, title)`. The HTML file must call `createNewGame()` in order to start a Danmakanvas Instance. The canvas ID passed as a parameter is used as the primary identifier of the Danmakanvas Instance. 

Each new game keeps track of the bullets, current plurals running, the canvas, and the frame counter, among other things. The NewGame objects have functionality to start a game associated with a canvas ID, which resets the current Danmakanvas Instance associated with the canvas ID. The actual code to run in the instances is located in the Plural Modules, which will be discussed shortly.

When a new game is started, it also sets an interval to run a main update loop if one is not already running for the provided canvas ID. This ensures that while multiple Danmakufu Instances can run, trying to restart an existing one will reset it without compromising it in any way. The main update loop (`update_main()`) wipes the canvas (to allow the updates to be drawn), then directs the plural controller to update (this will be discussed soon). It checks every bullet and forces them to update, then removes bullets that are out of bounds as well as bullets that have existed longer than their specified lifespan. The bullets are rendered, as well as some debug text.

The main update loop for any canvas runs *every 20 ms*, or *50 FPS*.

Now, Plural Modules. Plural Modules contain user-defined code. All Plural Modules *MUST* implement the `getPluralController(currgame, canvasid)` function, which returns a Plural Object to be associated with the provided canvas ID. As of the current version, the Plural Object's role is mostly ceremonial since only one attack at a time is currently supported (more may be supported in the future by giving Single objects a `finished` field and by having Plural objects check the status of the current Single). However, all Plural objecs must have a `step`, list of `singles`, `update()`, and `remove()`. The step starts at 0 and refers to which single is currently in use. The update function calls the current single to update, while remove clears the array of Single objects.

Single Objects are the meat of the system, controlling the happenings of a given Danmakanvas Instance. Each Single should have a list of `tasks`, though actually using this depends on whether or not such tasks are needed. As with the pattern, they must also have an `update()` and `remove()`, where update performs updates every 20 ms and handles task cleanup. 

Tasks are the smallest unit of control in Danmakanvas. Methods of creating subtasks are possible but require manual cleanup if done as the Single is only responsible for cleaning up tasks it creates itself. Tasks should have a `counter`, `maxcounter`, and `finished` state as well as the usual `update()` and `remove()`. `maxcounter` is a construct used for terminating the task after a given number of frames have passed. The counter refers to the frame count. The finished state should be set to true if the counter reaches the max counter - this allows the Single to properly dispose of the task on its update. All objects created by a task should be deleted in the tasks' `remove()` function.

### Programming using Danmakanvas

All programming is done via the Plural Modules. In a given Plural Module, ensure that `getPluralController()` has a case for the canvas ID you are targeting, and ensure that it receives a Plural object. The Template should assist in setting up the basics.

Note how `currgame` is passed along as a parameter for all Plurals, Singles, and Tasks. This is because bullets must be manually inserted into the current Danmakanvas Instance's list of bullets in order to function. Besides this, any number of arbitrary parameters may be used. Please avoid using `this.` for custom variables if possible, as they are not part of the object specifications.

Danmakanvas comes with a number of potentially useful functions built into the main game/Danmakanvas Instance object (`currgame`). Examples include `isinbounds()`, `toRadians()`, `contains()`, and `isEmpty()`, which are included for use in the main engine but may be used elsewhere. 

For actual control, `everyinterval()` allows for certain actions to be performed at a set rate. For example, `everyinterval(5)` will return true every five frames (e.g. 100, 200, 300, 400ms). Please note that Danmakanvas runs at 50 FPS rather than 60 FPS.

Now, for spawning bullets. We can run `new EnemyShot()` to accomplish this (or one of the provided bullet creation functions). The constructor contains a lot of parameters - `EnemyShot(x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)`. Most of these are obvious. Note that Danmakanvas currently only supports POSITIVE ACCELERATION. Slowing down a bullet to a lower max speed does NOT currently work. Color is a string, supporting all standard HTML supporte colors - including rgb(r,g,b) and hex notation (with the #). The next three parameters control the visuals of the bullet - the bullet radius, stroke radius, and stroke width. Hitbox is currently not used but is locked in for futureproofing. 

The vanishtime field of the bullet (EnemyShot) object behaves in a special manner. If the provided value is greater than 0, then that denotes how many frames the bullet will exist for before deleting. Otherwise the bullet will be deleted when it exits the game bounds. By default, the game bounds are a 32 pixel buffer around the canvas.

Like all JavaScript objects, it is possible to define a function and associate that function as part of the shot object. By default, the EnemyShot update runs a basic update that updates position, acceleration, and exist time. The EnemyShot `customupdate()` function can be manually overridden to induce interesting behavior.

Note that as of v2.2-dev3, there are a variety of bullet creation functions that can be used instead of the base constructor. These functions all automatically handle adding a bullet to the Danmakanvas Instance currently running. It is recommended that these be used instead of the default constructor in all cases.

### Available Functions

The following functions are provided as part of the Danmakanvas Instance (`currgame`, passed by reference as a parameter):

* `isinbounds(obj, wd, ht)` - Returns true if bullet is in the rectange created with (0, 0) and (wd, ht) with a 32 pixel buffer; false otherwise  
* `toRadians(i)` - Returns i converted from degrees to radians  
* `contains(a, obj)` - Returns true if a is present in the provided object; false otherwise  
* `isEmpty(obj)` - Returns true if the provided object is empty; false otherwise  
* `everyinterval(n)` - Returns true if the current frame count % n = 0; false otherwise  

The following functions are provided as Object Constructors:  
Note that these should not be used as they have proper wrappers that reduce some of the overhead. If they must be used, please note that they must be called with `new`.  

* `EnemyShot(x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Creates an enemy shot with the provided parameters and returns the created object  
* `DMKText(x, y, fillStyle, font, textAlign, content, currgame)` - Creates a Danmakanvas text object with the provided parameters and returns the created object.  

The following functions are provided as part of the Danmakanvas 'API':

General Functions:

* `GetCenterX(currgame)` - Returns half the width of the canvas  
* `GetCenterY(currgame)` - Returns half the height of the canvas  
* `DeleteShot(bullet, currgame)` - Deletes the bullet from the game  

Bullet Creation Functions:

- A1 variants set acceleration and max speed to 0 and set vanishtime to -1 (bullets only delete when out of bounds)
- All bullet creation functions add the bullets to the game's list of bullets automatically

* `CreateShotA1(n, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Creates a bullet  
* `CreateShotA2(n, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Creates a bullet  
* `CreateRingA1(n, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Creates a n-way ring  
* `CreateRingA2(n, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Creates a n-way ring  
* `CreateSpreadA1(n, angoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Creates an n-way spread with the provided angle offset  
* `CreateSpreadA2(n, angoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Creates an n-way spread with the provided angle offset  
* `CreateStackA1(n, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Creates an n-stack with the provided speed offset  
* `CreateStackA2(n, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Creates an n-stack with the provided speed offset  
* `CreateRingStackA1(n, m, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Combination of CreateRingA1 and CreateStackA1  
* `CreateRingStackA2(n, m, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Combination of CreateRingA1 and CreateStackA1  
* `CreateSpreadStackA1(n, m, angoffset, spdoffset, x, y, speed, angle, color, brad, srad, swid, hitbox, currgame)` - Combination of CreateSpreadA1 and CreateStackA1  
* `CreateSpreadStackA2(n, m, angoffset, spdoffset, x, y, speed, angle, accel, maxspeed, color, brad, srad, swid, hitbox, vanishtime, currgame)` - Combination of CreateSpreadA1 and CreateStackA1  

Object Functions:

* `CreateText(x, y, fillStyle, font, textAlign, content, currgame)` - Creates a text object


### Miscellaneous

* There is no background color set for the canvas. Please use CSS for colors. We recommend a black or near-black background for the canvas as text defaults to white and as bullets tend to look better on a black background.

### Examples

Example scripts are documented here. In recommended reading order, these are:

1. [Template](https://sparen.github.io/Danmakanvas/Examples/Template.html) - Basic template for all Danmakanvas scripts  
2. [Example_Interval](https://sparen.github.io/Danmakanvas/Examples/Example_Interval.html) - Example showcasing `everyinterval()` usage as well as basic bullet spawning  
3. [Example_Override](https://sparen.github.io/Danmakanvas/Examples/Example_Override.html) - Example showcasing overriding of EnemyShot `customupdate()` to induce special behavior  
4. [Example_RingSpreadStack](https://sparen.github.io/Danmakanvas/Examples/Example_RingSpreadStack.html) - Example showcasing usage of GetCenterX/Y and some ring and stack functions. Also covers `customupdate()` overriding with these functions and provides more detail  

### Future Work

Listed in no particular order:

- Lasers
- Support for multiple singles with progression  

