var SceneController = function(document)
{
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0xf0f0f0 );

    this.container = document.createElement( 'div' );
    document.body.appendChild( this.container );

    this.renderer;

    this.gui = new dat.GUI();
}

SceneController.prototype.setup = function()
{
    this.setupCamera();
    this.setupLight();
    this.setupGeometry();

    this.renderer = new RaytracingRenderer(this.scene, this.camera);
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = "0px";
    this.renderer.domElement.style.left = "0px";

    this.container.appendChild( this.renderer.domElement );

    this.setupGUI();
}

SceneController.prototype.setupGUI = function()
{
    //set default value here
    this.params = {
        screenController : this,
        superSamplingRate : this.renderer.superSamplingRate,
        maxRecursionDepth : this.renderer.maxRecursionDepth,
        render: function(){this.screenController.render();}
    };

    this.gui.add(this.params, 'superSamplingRate', 0, 3).step(1).name("Supersampling rate").onChange(function(newValue){this.object.screenController.updateModel()});
    this.gui.add(this.params, 'maxRecursionDepth', 0, 5).step(1).name("Max recursion").onChange(function(newValue){this.object.screenController.updateModel()});
    this.gui.add(this.renderer, 'allLights').listen();
    this.gui.add(this.renderer, 'calcDiffuse').listen();
    this.gui.add(this.renderer, 'calcPhong').listen();

    this.gui.add(this.params, "render");

    this.gui.open();
}

SceneController.prototype.setupCamera = function()
{
    this.camera = new THREE.PerspectiveCamera( 60, this.canvasWidth / this.canvasHeight, 1, 1000 );
    this.camera.position.z = 600;
}

// check out this very simple shader example https://gist.github.com/kylemcdonald/9593057
SceneController.prototype.setupGeometry = function()
{
    // materials
    var phongMaterial = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        specular: 0x222222,
        shininess: 150,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var phongMaterialRed = new THREE.MeshPhongMaterial( {
        color: 0xff0000,
        specular: 0x222222,
        shininess: 150,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var phongMaterialGreen = new THREE.MeshPhongMaterial( {
        color: 0x00ff00,
        specular: 0x222222,
        shininess: 150,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );
    var phongMaterialBlue = new THREE.MeshPhongMaterial( {
        color: 0x0000ff,
        specular: 0x222222,
        shininess: 150,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var phongMaterialYellow = new THREE.MeshPhongMaterial( {
        color: 0x880000,
        specular: 0x222222,
        shininess: 150,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var phongMaterialBox = new THREE.MeshPhongMaterial( {
        color: 0xffffff,
        specular: 0x111111,
        shininess: 100,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var phongMaterialBoxBottom = new THREE.MeshPhongMaterial( {
        color: 0x666666,
        specular: 0x111111,
        shininess: 100,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );

    var mirrorMaterialSmooth = new THREE.MeshPhongMaterial( {
        color: 0xffaa00,
        specular: 0x222222,
        shininess: 10000,
        vertexColors: THREE.NoColors,
        flatShading: false
    } );
    mirrorMaterialSmooth.mirror = true;
    mirrorMaterialSmooth.reflectivity = 0.3;

    var torusGeometry = new THREE.TorusGeometry(100, 20, 16, 100);
    var planeGeometry = new THREE.BoxGeometry(600, 5, 600);
    var cylinderGeometry = new THREE.CylinderGeometry(60, 60, 100, 64);
    var sphereGeometry = new THREE.SphereGeometry( 100, 32, 32 );

    var torus = new THREE.Mesh( torusGeometry, phongMaterialBlue );
    torus.scale.multiplyScalar( 0.5 );
    torus.position.set( - 50, -250 + 5, -50 );
    torus.rotation.y = 0.5;

    var boundingBox = new THREE.BoxGeometry(100, 120, 90);
    var boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialRed);
    boundingBoxMesh.position.set( - 50, -250 + 5, -50 );
    torus.boundingBox = boundingBoxMesh;
    this.scene.add(torus);

    var torus2 = new THREE.Mesh( torusGeometry, phongMaterialRed );
    torus2.scale.multiplyScalar( 0.5 );
    torus2.position.set( 175, -250 + 5, -150 );

    boundingBox = new THREE.BoxGeometry(120, 120, 90);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialRed);
    boundingBoxMesh.position.set( 175, -250 + 5, -150 );
    torus2.boundingBox = boundingBoxMesh;
    this.scene.add(torus2);

    var sphere = new THREE.Mesh( sphereGeometry, phongMaterialGreen );
    sphere.scale.multiplyScalar( 0.5 );
    sphere.position.set( 60, -250 + 5, -75);

    boundingBox = new THREE.BoxGeometry(100, 100, 100);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.position.set(60, -250 + 5, -75);
    sphere.boundingBox = boundingBoxMesh;
    this.scene.add(sphere);

    var cylinder = new THREE.Mesh( cylinderGeometry, mirrorMaterialSmooth );
    cylinder.position.set( -175, -250 + 2.5, -150 );

    boundingBox = new THREE.BoxGeometry(120, 120, 120);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.position.set(-175, -250 + 2.5, -150);
    sphere.boundingBox = boundingBoxMesh;
    this.scene.add(cylinder);

    // bottom
    var plane = new THREE.Mesh( planeGeometry, phongMaterialBoxBottom );
    plane.position.set( 0, - 300 + 2.5, - 300 );

    boundingBox = new THREE.BoxGeometry(600, 5, 600);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.position.set(0, -295, -300);
    plane.boundingBox = boundingBoxMesh;
    this.scene.add(plane);

    // top
    var plane1 = new THREE.Mesh( planeGeometry, phongMaterialBox );
    plane1.position.set( 0, 300 - 2.5, - 300 );

    boundingBox = new THREE.BoxGeometry(600, 5, 600);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.position.set(0, 295, -300);
    plane1.boundingBox = boundingBoxMesh;
    this.scene.add(plane1);

    // back
    var plane2 = new THREE.Mesh( planeGeometry, mirrorMaterialSmooth );
    plane2.rotation.x = 1.57;
    plane2.position.set( 0, 0, - 300 );

    boundingBox = new THREE.BoxGeometry(600, 5, 600);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.rotation.x = 1.57;
    boundingBoxMesh.position.set(0, 0, -295);
    plane2.boundingBox = boundingBoxMesh;
    this.scene.add(plane2);

    // left
    var plane3 = new THREE.Mesh( planeGeometry, phongMaterialBlue );
    plane3.rotation.z = 1.57;
    plane3.position.set( - 300, 0, - 300 );

    boundingBox = new THREE.BoxGeometry(600, 5, 600);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.rotation.z = 1.57;
    boundingBoxMesh.position.set(-295, 0, -300);
    plane3.boundingBox = boundingBoxMesh;
    this.scene.add(plane3);

    // right
    var plane4 = new THREE.Mesh( planeGeometry, phongMaterialRed );
    plane4.rotation.z = 1.57;
    plane4.position.set( 300, 0, - 300 );

    boundingBox = new THREE.BoxGeometry(600, 5, 600);
    boundingBoxMesh = new THREE.Mesh(boundingBox, phongMaterialGreen);
    boundingBoxMesh.rotation.z = 1.57;
    boundingBoxMesh.position.set(295, 0, -300);
    plane4.boundingBox = boundingBoxMesh;
    this.scene.add(plane4);
}

SceneController.prototype.setupLight = function()
{
    var intensity = 70000;
    var light = new THREE.PointLight( 0xffffff, intensity * 2 );
    light.position.set( 0, 0, 300 );
    light.physicalAttenuation = true;
    this.scene.add( light );

    var light = new THREE.PointLight( 0xffaa55, intensity );
    light.position.set( - 200, 100, 100 );
    light.physicalAttenuation = true;
    this.scene.add( light );

    var light = new THREE.PointLight( 0x55aaff, intensity );
    light.position.set( 200, 100, 100 );
    light.physicalAttenuation = true;
    this.scene.add( light );
}

SceneController.prototype.render = function() {
    this.renderer.render();
}

SceneController.prototype.updateModel = function()
{
    this.renderer.maxRecursionDepth = this.params.maxRecursionDepth;
    this.renderer.superSamplingRate = this.params.superSamplingRate;
}
