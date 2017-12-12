
/*
 * This is main.js which is referenced directly from within
 * a <script> node in index.html
 */

// "use strict" means that some strange JavaScript things are forbidden
"use strict";

function Path(separator) {
    this.separator = separator;
    this.elements = [];

    this.add = function(pathElement) {
        this.elements.push(pathElement);
    };

    this.toString = function() {
        var finalStr = "";
        var elementsSize = this.elements.length;
        for (var i = 0; i < elementsSize; i++) {
            if (i == elementsSize - 1) {
                finalStr += this.elements[i];
            }
            else {
                finalStr += this.elements[i] + separator;
            }
        }
        return finalStr;
    };
}

// this shall be the function that generates a new path object
var makePath = function(pathElement) {
    var path = (typeof pathElement == "undefined") ? new Path(",") :
                                                     new Path(pathElement);
    var pathCreator = function(pathElement) {
        if (typeof pathElement == "undefined") {
            return path.toString();
        }
        else {
            path.add(pathElement);
        }
    }
    return pathCreator;
}


// the main() function is called when the HTML document is loaded
var main = function() {

    ////////////////////////////////////////////////////////////
    //create a path, add a few points on the path, and print it
    var path1 = makePath("/");

    path1("A"); 
    path1("B"); 
    path1("C");

    var path2 = makePath("-->");
    path2("Berlin"); 
    path2("San Francisco"); 
    path2("Vancouver");

    var path3 = makePath();

    path3("A");
    path3("B");
    path3("C");

    window.console.log("path 1 is " + path1() );
    window.console.log("path 2 is " + path2() );
    window.console.log("path 3 is " + path3() );

    ////////////////////////////////////////////////////////////
    // second example
    window.console.log('This is the start.');

    // sets a timeout and calls the callbackFunction
    // after the timeout. 
    // The specified callback is 0!!! milliseconds
    setTimeout(function callbackFunction() {
        window.console.log('This is a msg from call back.');
    }, 0);

    window.console.log('This is just a message.');


};
