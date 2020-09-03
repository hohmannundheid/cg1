# Computer Graphics 1 (TU Berlin)
This is the code base for the assignments I had for the computer graphics course that was the CG 1 course taught at the Technical University Berlin.
This was an introductory course which covered a classical forward rendering pipeline from front to back. Among the topics covered were:

- Scene graph representations and linear transformations
- Camera projections
- Texture mapping
- Various shading techniques (Gourad, Phong, etc.)
- Color theory

## Building
Since the assignment were all written in WebGL it should be possible to run these examples in a browser that supports WebGL.
Opening `index.html` in a browser should get you to the main page.

## Examples
![A raytracer written in WebGL](https://tstullich.github.io/img/cg1-raytracer.png)

![The Phong shading model implemented in WebGL shaders](https://tstullich.github.io/img/phong-shading.png)

## Features
Each `exercise` folder in the root directory represents an assignment. They each covered one of the aforementioned topics.

* exercise0: Warm up assignment to get the environment working
* exercise1: Interactive scene graph and affine transformations
* exercise2: Perspective and orthographic camera models
* exercise3: Geometry shading (Flat, Phong, Gourad, and other shading models)
* exercise4: Texture mapping
* exercise5: Raytracing

## Future Work
* Cleaning up the code base
