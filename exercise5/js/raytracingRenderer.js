/**
 * RaytracingRenderer interpretation of http://github.com/zz85
 */

var RaytracingRenderer = function (scene, camera)
{
    this.scene = scene;
    this.camera = camera;

    this.rendering = false;
    this.superSamplingRate = 0;
    this.maxRecursionDepth = 2;

    this.calcDiffuse = true;
    this.calcPhong = true;
    this.allLights = true;

    this.canvas = document.createElement( 'canvas' );
    this.context = this.canvas.getContext( '2d', {
        alpha: false
    } );

    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.setSize( this.canvas.width, this.canvas.height );

    this.clearColor = new THREE.Color( 0x000000 );

    this.domElement = this.canvas;

    this.autoClear = true;

    this.lights = [this.scene.children[0],
        this.scene.children[1],
        this.scene.children[2]];
}

RaytracingRenderer.prototype.setClearColor = function ( color, alpha )
{
    clearColor.set( color );
};

RaytracingRenderer.prototype.setSize = function ( width, height )
{
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    this.context.fillStyle = 'white';
};

RaytracingRenderer.prototype.clear = function () {	};

RaytracingRenderer.prototype.render = function ()
{
    if(this.rendering == true)
        return;

    this.rendering = true;

    var clock = new THREE.Clock();
    clock.start();

    // update scene graph
    if ( this.scene.autoUpdate === true )
        this.scene.updateMatrixWorld();

    // update camera matrices
    if ( this.camera.parent === null )
        this.camera.updateMatrixWorld();

    this.context.clearRect( 0, 0, this.canvasWidth, this.canvasHeight );

    // http://www.javascripture.com/ImageData
    // imageData holds RGBA data for image. imagedata[0] red; imagedata[1] green, imagedata[2] blue, imagedata[3] alpha
    // iterating over imageData requires first loop over y, second loop over x
    var imageData = this.context.createImageData(this.canvasWidth, this.canvasHeight);

    //calculate camera cameraPosition, camera normal matrix and perspective
    //in my implementation, perspective is a single float value that depends on the camera FOV and the canvasHeight
    var cameraPosition = new THREE.Vector3();
    cameraPosition.setFromMatrixPosition(this.camera.matrixWorld);

    var cameraNormalMatrix = this.camera.normalMatrix;

    var perspective = 0.5 / Math.tan(THREE.Math.degToRad(this.camera.fov * 0.5)) * this.canvasHeight;

    //iterate over all pixels and render
    //this will set individial pixels. uncomment once you start working
    var indexRunner = 0;
    for(var y = 0; y < this.canvasHeight; y++)
    {
        for(var x = 0; x < this.canvasWidth; x++)
        {
            var pixelColor = new THREE.Color(0,0,0);

            if(this.superSamplingRate < 1)
            {
                pixelColor = this.renderPixel(x, y, cameraPosition, cameraNormalMatrix, perspective);
            } else
            {
                pixelColor = this.superSample(x, y, cameraPosition, cameraNormalMatrix, perspective, 0);

            }
            imageData.data[indexRunner] = pixelColor.r * 255.0;
            imageData.data[indexRunner + 1] = pixelColor.g * 255.0;
            imageData.data[indexRunner + 2] = pixelColor.b * 255.0;
            imageData.data[indexRunner + 3] = 255.0;
            indexRunner += 4;
        }
    }
    this.context.putImageData( imageData, 0, 0 );

    clock.stop();

    console.log("Finished rendering in " + clock.elapsedTime + " seconds. Image " + this.canvasWidth + " w / " + this.canvasHeight + " h");
    alert("Finished rendering in " + clock.elapsedTime + " seconds. Image " + this.canvasWidth + " w / " + this.canvasHeight + " h");

    this.rendering = false;
}

/*
 * My attempt at trying to implement supersampling. There are a few problems with this implementation which I was not able
 * to solve. Perhaps there is room for some partial credit here if I explain my thought process a bit :)
 * 1. I was unsure of how to average the color values. The way I had imagined it was I would just add the four sampled values
 *    and then average the individual RGB values of the final color, but that was too inconsistent and gave me improper values
 * 2. Finding a good thresholding value to decide when to subsample. I tried to just set an upper threshold and decided to
 *    subsample the RGB values of my samples' color values were above that compared to the center sample, but that did not
 *    give proper results.
 * 3. Subdividing properly. My current implementation simply divides the x and y in half to make a smaller grid, but
 *    that does create a proper subspace since the grid becomes too small too quickly. Another approach would have
 *    been better here I am sure.
 */
RaytracingRenderer.prototype.superSample = function(x, y, cameraPosition, cameraNormalMatrix, perspective, samplingRate) {
    var pixelColor = new THREE.Color();

    var topLeftColor = new THREE.Color();
    topLeftColor.add(pixelColor.add(this.renderPixel(x - 1, y + 1, cameraPosition, cameraNormalMatrix, perspective)));

    var topRightColor = new THREE.Color();
    topRightColor.add(pixelColor.add(this.renderPixel(x + 1, y + 1, cameraPosition, cameraNormalMatrix, perspective)));

    var bottomLeftColor = new THREE.Color();
    bottomLeftColor.add(pixelColor.add(this.renderPixel(x - 1, y - 1, cameraPosition, cameraNormalMatrix, perspective)));

    var bottomRightColor = new THREE.Color();
    bottomLeftColor.add(pixelColor.add(this.renderPixel(x + 1, y - 1, cameraPosition, cameraNormalMatrix, perspective)));

    var centerColor = new THREE.Color();
    centerColor.add(pixelColor.add(this.renderPixel(x, y, cameraPosition, cameraNormalMatrix, perspective)));

    if (this.aboveThreshold() && samplingRate < this.superSamplingRate) {
        // The threshold stepped over so we would need to subsample again
        this.superSample(Math.floor(x / 2), Math.floor(y / 2), cameraPosition, cameraNormalMatrix, perspective, samplingRate + 1);
    } else {
        pixelColor.add(topLeftColor).add(topRightColor).add(bottomLeftColor).add(bottomRightColor);

        // We took four samples to I figured the final color would be the average of them
        pixelColor.r = pixelColor.r / 4;
        pixelColor.g = pixelColor.g / 4;
        pixelColor.b = pixelColor.b / 4;
    }

}

// My simple thresholding function for color values
RaytracingRenderer.prototype.aboveThreshold = function(sample1, sample2, sample3, sample4, center) {
    var color1 = sample1.clone();
    var color2 = sample2.clone();
    var color3 = sample3.clone();
    var color4 = sample4.clone();

    color1.add(center);
    if (Math.max(color1.r, 0.9) > 0.9 || Math.max(color1.g, 0.9) > 0.9 || Math.max(color1.b, 0.9) > 0.9) {
        return false;
    }

    color2.add(center);
    if (Math.max(color2.r, 0.9) > 0.9 || Math.max(color2.g, 0.9) > 0.9 || Math.max(color2.b, 0.9) > 0.9) {
        return false;
    }

    color3.add(center);
    if (Math.max(color3.r, 0.9) > 0.9 || Math.max(color3.g, 0.9) > 0.9 || Math.max(color3.b, 0.9) > 0.9) {
        return false;
    }

    color4.add(center);
    if (Math.max(color4.r, 0.9) > 0.9 || Math.max(color4.g, 0.9) > 0.9 || Math.max(color4.b, 0.9) > 0.9) {
        return false;
    }
    return true;
}

RaytracingRenderer.prototype.renderPixel = function(x, y, cameraPosition, cameraNormalMatrix, perspective)
{
    var pixelColor = new THREE.Color(0, 0, 0);

    //calculate ray origin & direction
    var rayOrigin = cameraPosition;
    var direction = new THREE.Vector3();
    direction.set(x - this.canvasWidth / 2.0, -(y - this.canvasHeight / 2.0), -perspective);
    direction.applyMatrix3(cameraNormalMatrix).normalize();

    this.spawnRay(rayOrigin, direction, pixelColor, 0);

    return pixelColor;
}

//this method has most of the stuff of this exercise.
//good coding style will ease this exercise significantly.
RaytracingRenderer.prototype.spawnRay = function(origin, direction, pixelColor, recursionDepth)
{
    //create raycaster and intersect with children of scene
    var raycaster = new THREE.Raycaster();
    raycaster.set(origin, direction);

    // This was supposed to be the point where I swap in my custom
    // raytracer for my bounding box checks. Unfortunately, I did not
    // quite finish it but perhaps there is a chance for partial credit :)
    // The work for my ray tracer can be found in the 'customRaytracer.js' file
    //
    //var raycaster = new CustomRayTracer();
    //raycaster.set(origin, direction);
    //var intersects = raycaster.intersectObjects(this.scene.children);

    var intersects = raycaster.intersectObjects(this.scene.children, true);
    //if intersections, compute color (this is the main part of the exercise)
    if (intersects.length > 0) {
        if (!this.calcDiffuse && !this.calcPhong) {
            pixelColor.add(intersects[0].object.material.color);
            return pixelColor;
        }

        // calculate phong model for each intersection point
        var normal = this.computeNormal(intersects[0], intersects[0].face);
        var lightSources = this.allLights ? this.lights.length : 1;
        for (var lightIndex = 0; lightIndex < lightSources; lightIndex++) {
            var light = this.lights[lightIndex].clone();
            var lightDirection = light.position.sub(intersects[0].point).normalize();
            raycaster.set(intersects[0].point, lightDirection);

            var shadowIntersections = raycaster.intersectObjects(this.scene.children, true);
            if (shadowIntersections.length == 0) {
                // No intersections made. Calculate phong model
                var phong = this.phong(origin, normal, intersects[0].point, this.lights[lightIndex], intersects[0].object);
                pixelColor.add(phong);
            }
        }

        //if material is mirror and with maxRecursionDepth, spawnRay again
        if (intersects[0].object.material.mirror && recursionDepth < this.maxRecursionDepth) {
            // Calculate reflection
            var originCopy = origin.clone();
            var surfacePoint = intersects[0].point.clone();
            originCopy.sub(surfacePoint);
            var reflectedRay = originCopy.reflect(normal).multiplyScalar(-1).normalize();
            this.spawnRay(intersects[0].point, reflectedRay, pixelColor, recursionDepth + 1);
        }
    }
}

RaytracingRenderer.prototype.phong = function(origin, normal, point, light, intersectedObject) {
    var originPosition = origin.clone();
    var surfacePosition = point.clone();
    var lightPosition = light.position.clone();

    // Components for phong shading
    var L = lightPosition.sub(surfacePosition);

    // Compute light attenuation (fall-off)
    var intensity = light.intensity;
    var attenuation = this.computeAttenuation(L) * intensity;

    // Normalize light vector after calculating attenuation
    L.normalize();

    var R = L.reflect(normal).multiplyScalar(-1);
    var E = originPosition.sub(surfacePosition).normalize();

    // Calculate diffuse component
    var materialColor = intersectedObject.material.color.clone();
    var diffuseFactor = Math.max(L.dot(normal), 0) * attenuation;
    var diffuseColor = materialColor.multiplyScalar(diffuseFactor);

    // Calculate specular component
    var specularColor = light.color.clone();
    var specularFactor = Math.pow(Math.max(R.dot(E), 0), intersectedObject.material.shininess) * attenuation;
    specularColor.multiplyScalar(specularFactor);

    return diffuseColor.add(specularColor);
}

RaytracingRenderer.prototype.computeNormal = function(intersectedObject, face)
{
    var inverseMatrix = new THREE.Matrix4();
    inverseMatrix.getInverse(intersectedObject.object.matrixWorld);
    var intersectionPoint = intersectedObject.point.clone();
    intersectionPoint.applyMatrix4(inverseMatrix);

    // Grab point coordinates from face
    var p1 = intersectedObject.object.geometry.vertices[face.a].clone();
    var p2 = intersectedObject.object.geometry.vertices[face.b].clone();
    var p3 = intersectedObject.object.geometry.vertices[face.c].clone();

    // Calculate the vertices
    var v1 = p1.sub(p2);
    var v2 = p3.sub(p2);
    var v3 = intersectionPoint.sub(p2);

    // Find the dot products
    var dot00 = v1.dot(v1);
    var dot01 = v1.dot(v2);
    var dot11 = v2.dot(v2);

    // Calculate the denominator
    var denom = (dot00 * dot11) - (dot01 * dot01);

    // Calculate Barycentric weights
    var dot20 = v3.dot(v1);
    var dot21 = v3.dot(v2);
    var bary1 = (dot11 * dot20 - dot01 * dot21) / denom;
    var bary2 = (dot00 * dot21 - dot01 * dot20) / denom;
    var bary3 = 1 - bary1 - bary2;

    // Multiply weights with vertex normals
    var v1Normal = face.vertexNormals[0].clone();
    v1Normal.multiplyScalar(bary1);
    var v2Normal = face.vertexNormals[1].clone();
    v2Normal.multiplyScalar(bary3);
    var v3Normal = face.vertexNormals[2].clone();
    v3Normal.multiplyScalar(bary2);

    // Form interpolated normal
    var N = new THREE.Vector3();
    N.add(v1Normal);
    N.add(v2Normal);
    N.add(v3Normal);

    // Transform N to world coordinates
    var normalMatrix = new THREE.Matrix3();
    normalMatrix.getNormalMatrix(intersectedObject.object.matrixWorld);
    N.applyMatrix3(normalMatrix).normalize();

    return N;
};

RaytracingRenderer.prototype.computeAttenuation = function(light) {
    var length = light.length();
    return 1 / (length * length);
}
