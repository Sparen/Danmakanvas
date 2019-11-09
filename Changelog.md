# Changelog

Only versions past 2.1 have their changes documented here.

Source code and usage examples can be found on Github.

### v2.2-dev4 [Nov 08, 2019]
* Added `DMKText` object and general use `CreateText()` function for text object creation  
* EnemyShot objects now have fields for their render fields (brad, srad, swid) as well as new graphic and swid2 parameters for custom graphics  
* Implemented `SetShotGraphic()` and added support for the Rhombus/Diamond shape  

### v2.2-dev3 [Nov 03, 2019]
* Moved existing A1 variants to the A2 designation and created separate A1 designations for all existing bullet creation functions  
* Implemented `CreateShotA1()` and `CreateShotA2()`  
* Implemented `DeleteShot()`  

### v2.2-dev2 [Nov 02, 2019]

* Implemented `CreateRingA1()`, `CreateSpreadA1()`, `CreateStackA1()`, `CreateRingStackA1()`, and `CreateSpreadStackA1()`  
* Added `GetCenterX()` and `GetCenterY()`  

### v2.2-dev1 [Nov 01, 2019]

* Repository started  
* `var` -> `let` in new templates for Plural usage  
* Refactoring of main engine components to reduce naming conflicts  
* Fixed frameNo not being reset on canvas restart  
* Added ability to override an EnemyShot's update, allowing for custom behavior  

### v2.1.3 [Sep 11, 2018]

* Bullet Count text now uses canvas height instead of hardcoding.  

### v2.1.2 [Sep 10, 2018]

* isinbounds now uses canvas dimensions instead of hardcoding.  
* Version number now stored at top of file as variable for easy access and reference.  

### v2.1.1 [May 03, 2018]

* Fixed issue where clicking 'Run Danmakanvas Simulation' multiple times would start new instances of the simulation on the same canvas. Issue was a porting issue from 2.0, where startedplurals was not global and was accidentally made local to a game instance (where it was effectively useless). New clicks no longer boot up a new instance. [Thanks to Arcvasti]  
* Note that the 2.0 behavior of reset-on-click is not implemented in 2.1.1 and will require more changes in order to work. Whether or not this feature is necessary is a different issue entirely.  

### v2.1 [Apr 29, 2018]

* New version of Danmakanvas that has each game as a new instance, allowing for multiple canvases on the same page.  
* Plural/Single format is different and old scripts for 2.0 are not compatible with 2.1, as information on the current game must be threaded into the plurals and singles.  
