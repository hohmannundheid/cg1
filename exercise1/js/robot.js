var Node = function(object, depth, parentNode) {
    this.content = object;
    this.depth = depth;
    this.parentNode = parentNode;
    this.childNodes = [];
    this.nodeAtNextDepth = null;
    this.selected = false;
};

var SceneGraph = function() {
    this.root = null;
    this.maxDepth = 0;
    this.selectedNode = null;
    this.selectedSibling = 0;
    this.currentDepth = 0;
    this.currentSiblingIndex = 0;

    var insertChildIntoGraph = function(node, object, depth) {
        // Leaf node found inserting here
        if (node.nodeAtNextDepth == null) {
            var newNode = new Node(object, depth, node);
            node.childNodes.push(newNode);
            node.nodeAtNextDepth = newNode;
            maxDepth = depth;
        } else {
            insertChildIntoGraph(node.nodeAtNextDepth, object, depth + 1);
        }
    };

    /*
     * This method inserts a node as a leaf node into a given tree.
     * This method should always succeed since it always creates a new
     * level of depth if it recurses to a leaf node.
     */
    this.addChildNode = function(object) {
        if (this.root == null) {
            this.root = new Node(object, 0, null);
        } else {
            insertChildIntoGraph(this.root, object, 1);
        }
    };

    var insertSiblingIntoGraph = function(node, object, depth) {
        // We have recursed to a part of the tree where we cannot insert.
        // Going to return false in this case to indicate a failed insertion.
        if (node.nodeAtNextDepth == null && node.depth > depth) {
            return false;
        } else if (node.depth == depth) {
            // Need to check if we are not in root node
            if (node.parentNode != null) {
                // Found a node with the correct depth. Inserting here
                var newNode = new Node(object, depth, node);
                node.parentNode.childNodes.push(newNode);
                return true;
            } else {
                throw 'Attempting to insert a new root node! There can only be one root';
            }
        } else {
            insertSiblingIntoGraph(node.nodeAtNextDepth, object, depth);
        }
    };

    /*
     * This method inserts a node into a tree given a certain depth. It is assumed
     * that a node of given depth has already been inserted into the tree otherwise
     * the method will not succeed in inserting the new node.
     * Returns true or false based on whether or not the insertion was successful.
     */
    this.addSiblingNode = function(object, depth) {
        if (this.root == null) {
            this.root = new Node(object, 0, null);
            return true;
        } else {
            return insertSiblingIntoGraph(this.root, object, depth);
        }
    };

    var searchForNode = function(node, depth) {
        if (node.childNodes.length == 0) {
            return null;
        } else if (node.depth + 1 == depth) {
            return node.childNodes;
        } else {
            return searchForNode(node.nodeAtNextDepth, depth);
        }
    };

    /*
     * Searches for all of the childNodes at a given depth and returns them.
     * A null value is passed back in case there are no nodes at the given depth.
     * If depth of 0 is given only the root node will be returned.
     */
    this.searchForNodesAtDepth = function(depth) {
        if (this.root == null) {
            return null;
        } else if (depth == 0) {
            var l = [];
            l.push(this.root);
            return l;
        } else {
            return searchForNode(this.root, depth);
        }
    };

    this.getMeshesAtDepth = function(depth) {
        var meshes = [];
        if (this.root == null) {
            return meshes;
        } else if (depth == 0) {
            meshes.push(this.root.content);
            return meshes;
        } else {
            var result = searchForNode(this.root, depth);
            for (var i = 0; i < result.length; i++) {
                meshes.push(result[i].content);
            }
            return meshes;
        }
    };

    this.getMaxDepth = function() {
        return maxDepth;
    };

    this.getCurrentDepth = function() {
        return this.currentDepth;
    };

    this.setCurrentDepth = function(depth) {
        this.currentDepth = depth;
    };

    this.getCurrentSiblingIndex = function() {
        return this.currentSiblingIndex;
    };

    this.setCurrentSiblingIndex = function(index) {
        this.currentSiblingIndex = index;
    };

    this.build = function() {
        var finalObject = new THREE.Object3D;
        finalObject.add(this.root.content);

        var level = 0;
        while(++level <= maxDepth) {
            var objects = this.searchForNodesAtDepth(level);
            for (i = 0; i < objects.length; i++) {
                finalObject.add(objects[i].content);
            }
        }
        return finalObject;
    };

    this.updateSelectedNode = function() {
        if (this.selectedNode != null) {
            this.selectedNode.selected = (this.selectedNode.selected) ? false : true;
            this.toggleSelection();
        }
    };
};

var Robot = function() {
    this.sceneGraph = new SceneGraph;

    this.createShear = function(x, y, z) {
        var matrix = new THREE.Matrix4();
        matrix.set(1, y, z, 0,
                   x, 1, z, 0,
                   x, y, 1, 0,
                   0, 0, 0, 1);
        return matrix;
    };

    this.createScale = function(x, y, z) {
        var matrix = new THREE.Matrix4();
        matrix.set(x, 0, 0, 0,
                   0, y, 0, 0,
                   0, 0, z, 0,
                   0, 0, 0, 1);
        return matrix;
    };

    this.createRotation = function(rotationAngle, axis) {
        var matrix = new THREE.Matrix4();
        var cos = Math.cos(rotationAngle);
        var sin = Math.sin(rotationAngle);
        matrix.set( cos, sin, 0, 0,
                   -sin, cos, 0, 0,
                      0,   0, 1, 0,
                      0,   0, 0, 1);
        return matrix;
    };
};

Robot.prototype.buildRobot = function() {

    var robotHead = new THREE.SphereGeometry(0.15, 32, 32);

    var material = new THREE.MeshLambertMaterial({
        color: "blue",  // CSS color names can be used!
    });

    var torsoGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    var scaleMatrix = this.createScale(1.4, 1.9, 1);
    torsoGeometry.applyMatrix(scaleMatrix);
    var torso = new THREE.Mesh(torsoGeometry, material);

    var head = new THREE.Mesh(robotHead, material);
    head.position.set(0, 0.4, 0);

    var armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
    var armScaleMatrix = this.createScale(1, 2.5, 1);
    armGeometry.applyMatrix(armScaleMatrix);
    var leftArm = new THREE.Mesh(armGeometry, material);
    leftArm.position.set(0.3, 0.1, 0);

    var rightArm = new THREE.Mesh(armGeometry, material);
    rightArm.position.set(-0.3, 0.1, 0);

    var legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
    var leftLeg = new THREE.Mesh(legGeometry, material);
    leftLeg.position.set(0.15, -0.35, 0);

    var rightLeg = new THREE.Mesh(legGeometry, material);
    rightLeg.position.set(-0.15, -0.35, 0);

    this.sceneGraph.addChildNode(torso);
    this.sceneGraph.addChildNode(head);
    this.sceneGraph.addChildNode(leftArm);
    this.sceneGraph.addChildNode(leftLeg);
    this.sceneGraph.addSiblingNode(rightArm, 2);
    this.sceneGraph.addSiblingNode(rightLeg, 3);

    this.sceneGraph.selectedNode = this.sceneGraph.root;
    this.sceneGraph.selectedNode.selected = true;
    this.toggleSelection();

    return this.sceneGraph.build();
};

Robot.prototype.reset = function() {
    console.log("Hello from reset!");
};

Robot.prototype.selectChild = function(forward) {
    if (this.sceneGraph.selectedNode != null) {
        var nodes = [];
        var maxDepth = this.sceneGraph.getMaxDepth();
        var currentDepth = this.sceneGraph.getCurrentDepth();
        if (forward && currentDepth + 1 <= maxDepth) {
            nodes = this.sceneGraph.searchForNodesAtDepth(++currentDepth);
        } else if (!forward && this.sceneGraph.currentDepth - 1 >= 0) {
            nodes = this.sceneGraph.searchForNodesAtDepth(--currentDepth);
        } else if (!forward && this.sceneGraph.currentDepth == 0) {
            nodes = this.sceneGraph.searchForNodesAtDepth(currentDepth);
        }

        this.sceneGraph.selectedNode.selected = false;
        this.toggleSelection();
        this.sceneGraph.selectedNode = (nodes.length > 0) ? nodes[0] : this.sceneGraph.selectedNode;
        this.sceneGraph.selectedNode.selected = true;
        this.toggleSelection();

        this.sceneGraph.setCurrentDepth(currentDepth);
        this.sceneGraph.setCurrentSiblingIndex(0);
    }
};

Robot.prototype.selectSibling = function(forward) {
    if (this.sceneGraph.selectedNode != null) {
        var currentDepth = this.sceneGraph.getCurrentDepth();
        var currentSiblingIndex = this.sceneGraph.getCurrentSiblingIndex();
        var nodes = this.sceneGraph.searchForNodesAtDepth(currentDepth);

        this.sceneGraph.selectedNode.selected = false;
        this.toggleSelection();
        if (forward && currentSiblingIndex + 1 < nodes.length) {
            this.sceneGraph.selectedNode = nodes[++currentSiblingIndex];
        } else if (!forward && currentSiblingIndex - 1 >= 0 ) {
            this.sceneGraph.selectedNode = nodes[--currentSiblingIndex];
        } else if (!forward && currentSiblingIndex == 0) {
            this.sceneGraph.selectedNode = nodes[currentSiblingIndex];
        }

        this.sceneGraph.selectedNode.selected = true;
        this.toggleSelection();
        this.sceneGraph.setCurrentSiblingIndex(currentSiblingIndex);
    }
};

// Function needs to toggle local coordinate system
Robot.prototype.toggleSelection = function() {
    if (this.sceneGraph.selectedNode != null) {
        this.sceneGraph.selectedNode.content.material = (this.sceneGraph.selectedNode.selected) ?
        new THREE.MeshLambertMaterial({color: "red",}) :
        new THREE.MeshLambertMaterial({color: "blue",});
    }
};

Robot.prototype.rotateOnAxis = function(axis, degree) {
    console.log("Calling rotation on currently selected object");
};

Robot.prototype.selectNode = function(raycaster) {
    var i = 0;
    do {
        var targetList = this.sceneGraph.getMeshesAtDepth(i);
        var intersects = raycaster.intersectObjects(targetList);
        for (var j = 0; j < intersects.length; j++) {
            console.log("Mesh: " + intersects[j]);
        }
    } while (++i <= maxDepth);
};
