var CustomRayTracer = function() {
    this.origin = new THREE.Vector3();
    this.direction = new THREE.Vector3();
}

CustomRayTracer.prototype.set = function(origin, direction) {
    this.origin = origin;
    this.direction = direction;
}

CustomRayTracer.prototype.intersectObjects = function(sceneObjects) {
    var intersectedObjects = [];
    for (var i = 0; i < sceneObjects.length; i++) {
        var object = sceneObjects[i];
        if (object.type === "Mesh" &&
            this.intersectsBoundingBox(this.origin, this.direction, object)) {
            // If the bound box intersects with the bounding
            for (var j = 0; j < object.geometry.faces.length; j++) {
                var face = object.geometry.faces[j];
                if (this.intersectsTriangle(this.origin, this.direction, face, object)) {
                    intersectObjects.push(object);
                }
            }
        }
    }
}

/**
 * Checks if the bounding box is intersecting with the ray
 */
CustomRayTracer.prototype.intersectsBoundingBox = function(orig, dir, object) {
    for (var i = 0; i < object.geometry.faces.length; i++) {
        if (this.intersectsTriangle(orig, dir, object.geometry.faces[i], object)) {
            return true;
        }
    }
    return false;
}

CustomRayTracer.prototype.intersectsTriangle = function(orig, dir, face, object) {
    var origin = orig.clone();
    var direction = dir.clone();

    var vert0 = object.geometry.vertices[face.a].clone();
    var vert1 = object.geometry.vertices[face.b].clone();
    var vert2 = object.geometry.vertices[face.c].clone();

    // Compute normal
    var v0v1 = vert1.clone().sub(vert0);
    var v0v2 = vert2.clone().sub(vert0);
    var N = v0v1.cross(v0v2);
    var denom = N.dot(N);

    var NdotRayDirection = N.dot(direction);
    var epsilon = 1e-8;
    // Check if parallel
    if (Math.abs(NdotRayDirection) < epsilon) {
        return false;
    }

    var d = N.dot(vert0);
    var t = (N.dot(origin) + d) / NdotRayDirection;
    // Check if triangle is behind ray
    if (t < 0) {
        return false;
    }

    var P = origin.add(direction.multiplyScalar(t));

    // Checking if point is inside or outside of triangle
    var edge0 = vert1.clone().sub(vert0);
    var vP0 = P.clone().sub(vert0);
    var C = edge0.cross(vP0);
    if (N.dot(C) < 0) {
        return false;
    }

    var edge1 = vert2.clone().sub(vert1);
    var vP1 = P.clone().sub(vert1);
    C = edge1.cross(vP1);
    if (N.dot(C) < 0) {
        return false;
    }

    var edge2 = vert0.clone().sub(vert2);
    var vP2 = P.clone().sub(vert2);
    C = edge2.cross(vP2);
    if (N.dot(C) < 0) {
        return false;
    }

    return true;
}
