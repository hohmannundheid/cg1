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
				//TODO for ex5#
                for (var i = 0; i < this.superSamplingRate; i++) {
                    pixelColor.add(this.renderPixel(x, y, cameraPosition, cameraNormalMatrix, perspective));
                }
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

    var intersects = raycaster.intersectObjects(this.scene.children, true);
    //if intersections, compute color (this is the main part of the exercise)
    if (intersects.length > 0) {
        // calculate phong model for each intersection point
        var normal = this.computeNormal(intersects[0], intersects[0].face);
        if (this.allLights) {
            for (var lightIndex = 0; lightIndex < this.lights.length; lightIndex++) {
                var phong = this.phong(normal, intersects[0].point, lightIndex, intersects[0].object);
                pixelColor.add(phong);
            }
        } else {
            var phong = this.phong(normal, intersects[0].point, 0, intersects[0].object);
            pixelColor.add(phong);
        }
    }

    //if material is mirror and with maxRecursionDepthrecursion, spawnRay again
}

RaytracingRenderer.prototype.phong = function(normal, point, lightIndex, intersectedObject) {
    var surfacePosition = point.clone();
    var modelViewMatrix = intersectedObject.modelViewMatrix.clone();
    surfacePosition = surfacePosition.applyMatrix4(modelViewMatrix);

    var lightPosition = this.lights[lightIndex].position.clone();
    var L = lightPosition.sub(surfacePosition).normalize();
    var R = L.multiplyScalar(-1.0).reflect(normal);

    var E = surfacePosition.multiplyScalar(-1.0).normalize();

    var attenuation = this.computeAttenuation(this.lights[lightIndex]);

    var materialColor = intersectedObject.material.color.clone();
    var diffuseFactor = Math.max(normal.dot(L), 0.0);
    var diffuseColor = materialColor.multiplyScalar(diffuseFactor);

    var specularColor = intersectedObject.material.specular.clone();
    specularColor = specularColor.multiplyScalar(Math.pow(Math.max(R.dot(E), 0.0), intersectedObject.material.shininess));

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
    var bary3 = 1.0 - bary1 - bary2;

    // Multiply weights with vertex normals
    var v1Normal = face.vertexNormals[0].clone();
    v1Normal.multiplyScalar(bary1);
    var v2Normal = face.vertexNormals[1].clone();
    v2Normal.multiplyScalar(bary2);
    var v3Normal = face.vertexNormals[2].clone();
    v3Normal.multiplyScalar(bary3);

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
    return (1.0 / (1.0 + light.intensity * Math.pow(light.position.length(), 2)));
}
