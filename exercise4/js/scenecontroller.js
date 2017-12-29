var SceneController = function(document)
{
    this.texScene = new THREE.Scene();
    this.texScene.background = new THREE.Color(0xf0f0f0);
    this.texScene.fog = new THREE.Fog( 0x000000, 1500, 4000 );
    this.texRenderer = new THREE.WebGLRenderer( { antialias: true } );

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );
    this.scene.fog = new THREE.Fog( 0x000000, 1500, 4000 );
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );

    this.stats = new Stats();

    this.gui = new dat.GUI();
};

SceneController.prototype.setup = function()
{
    this.texRenderer.setPixelRatio( window.devicePixelRatio );
    this.texRenderer.setSize( window.innerWidth / 2 - 20, window.innerHeight);
    document.body.appendChild( this.texRenderer.domElement );
    this.texRenderer.autoClear = false;

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth / 2 - 20, window.innerHeight);
    this.renderer.setFaceCulling( THREE.CullFaceNone );
    document.body.appendChild( this.renderer.domElement );
    this.renderer.autoClear = false;

    //add performance logging
    this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );

    this.setupGUI();
    this.setupCamera();
    this.setupControls();
    this.setupLight();
    this.setupGeometry();

    this.render();
    this.animate();
};

SceneController.prototype.setupGUI = function()
{
    this.params = {
        screenController: this,
        texImg: 'earth',
        model: 'quad',
        texStyle: 'Nearest',
        sMapping: false,
        envMapping: false,
        drawSilhouette: false,
        bumpMap: false
    };

    var texNames = [ 'earth', 'colors', 'disturb', 'checker', 'checkerl', 'rings'];

    this.gui.add(this.params, 'texImg', texNames ).name('Texture Images').onChange(function(newValue){this.object.screenController.changeTexture()});
    this.gui.add(this.params, 'model', [ 'quad', 'box', 'sphere', 'torus'] ).name('3D Model').onChange(function(newValue){this.object.screenController.changeModel()});
    this.gui.add(this.params, 'texStyle', [ 'Nearest', 'Linear', 'MipMap Nearest', 'MipMap Linear'] ).name('Texture Style').onChange(function(newValue){this.object.screenController.changeTextureStyle()});

    this.gui.add( this.params, "sMapping" ).name("Spherical mapping").onChange(function(newValue){this.object.screenController.sphericalMap()});
    this.gui.add( this.params, "envMapping" ).name("Environment mapping").onChange(function(newValue){this.object.screenController.envMap()});
    this.gui.add( this.params, "drawSilhouette" ).name("Draw silhouette").onChange(function(newValue){this.object.screenController.silhouetteShaders()});
    this.gui.add( this.params, "bumpMap" ).name("Bump map").onChange(function(newValue){this.object.screenController.bumpMap()});

    this.gui.open()
};

SceneController.prototype.changeTexture = function()
{
    this.scene.remove(this.mesh);
    this.texture = new THREE.TextureLoader().load('js/textures/' + this.params.texImg + '.jpg');
    this.uniforms.texture.value = this.texture;
    this.texturedMat = new THREE.MeshBasicMaterial({map: this.texture});

    var material = new THREE.ShaderMaterial({
        map: this.texturedMat,
        uniforms: this.uniforms,
        vertexShader: this.vertShader,
        fragmentShader: this.fragShader,
    });

    this.mesh.material = material;
    this.scene.add(this.mesh);
    this.render();
};

SceneController.prototype.changeTextureStyle = function()
{
    if (this.params.texStyle == 'Nearest') {
        this.texture.minFilter = THREE.NearestFilter;
    } else if (this.params.texStyle == 'Linear') {
        this.texture.minFilter = THREE.LinearFilter;
    } else if (this.params.texStyle == 'MipMap Nearest') {
        this.texture.minFilter = THREE.LinearMipMapNearestFilter;
    } else {
        this.texture.minFilter = THREE.LinearMipMapLinearFilter;
    }
    this.texture.needsUpdate = true;
    this.render();
};

SceneController.prototype.changeModel = function()
{
    if (this.params.model.localeCompare("quad") === 0) {
        this.mesh.geometry = new THREE.PlaneBufferGeometry( 0.5, 0.5 );
    }
    else if (this.params.model.localeCompare("box") === 0) {
        this.mesh.geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    }
    else if (this.params.model.localeCompare("sphere") === 0) {
        this.mesh.geometry = new THREE.SphereGeometry(0.2, 30, 30);
    }
    else if (this.params.model.localeCompare("torus") === 0) {
        this.mesh.geometry = new THREE.TorusGeometry(0.1, 0.05, 8, 10);
    }
    this.render();
};

SceneController.prototype.setupCamera = function()
{
    var VIEW_ANGLE = 35;
    var ASPECT_RATIO = window.innerWidth/2 / window.innerHeight;
    var NEAR_PLANE = 0.01;
    var FAR_PLANE = 5000;

    this.texCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE );
    this.texCamera.position.z = 2;
    this.texCamera.lookAt(this.texScene.position);

    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT_RATIO, NEAR_PLANE, FAR_PLANE );
    this.camera.position.z = 2;
    this.camera.lookAt(this.scene.position);
};

SceneController.prototype.setupControls = function()
{
    this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 3.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.keys = [ 65, 83, 68 ];
    this.controls.addEventListener( 'change', this.render.bind(this) );
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 10;
};

SceneController.prototype.sphericalMap = function()
{
    this.render();
};

SceneController.prototype.silhouetteShaders = function()
{
    this.render();
};

SceneController.prototype.envMap = function()
{
    this.render();
};

SceneController.prototype.bumpMap = function(){

};

SceneController.prototype.setupGeometry = function()
{
    this.uniforms = {
        texture: {type: "t", value: null}
    };

    this.vertShader = document.getElementById('vertexShader').innerHTML;
    this.fragShader = document.getElementById('fragmentShader').innerHTML;

    var texGeometry = new THREE.PlaneBufferGeometry(0.5, 0.5);
    var texMaterial = new THREE.MeshLambertMaterial({color: "blue"});

    this.texture = new THREE.TextureLoader().load('js/textures/' + this.params.texImg + '.jpg');
    this.uniforms.texture.value = this.texture;
    this.texturedMat = new THREE.MeshBasicMaterial({map: this.texture});

    this.geometry = new THREE.PlaneBufferGeometry( 0.5, 0.5 );
    var material = new THREE.ShaderMaterial({
        map: this.texturedMat,
        uniforms: this.uniforms,
        vertexShader: this.vertShader,
        fragmentShader: this.fragShader,
    });
    // Render object in wireframe for debugging
    // var material = new THREE.MeshLambertMaterial( { color: "blue", wireframe: true} );
    this.texMesh = new THREE.Mesh( texGeometry, material );
    this.mesh = new THREE.Mesh( this.geometry, material );

    this.texScene.add(this.texMesh);
    this.scene.add(this.mesh);

};

SceneController.prototype.setupLight = function()
{
    var light = new THREE.PointLight( 0xffffcc, 1, 100 );
    light.position.set( 10, 30, 15 );
    this.texScene.add(light);
    this.scene.add(light);

    var light2 = new THREE.PointLight( 0xffffcc, 1, 100 );
    light2.position.set( 10, -30, -15 );
    this.texScene.add(light2);
    this.scene.add(light2);

    this.texScene.add( new THREE.AmbientLight(0x999999) );
    this.scene.add( new THREE.AmbientLight(0x999999) );
};

SceneController.prototype.render = function()
{
    this.camera.lookAt(this.scene.position);

    this.texRenderer.render(this.texScene, this.texCamera);
    this.renderer.render( this.scene, this.camera );
    this.stats.update();
};

SceneController.prototype.animate = function()
{
	requestAnimationFrame( this.animate.bind(this) );
    this.stats.update();
	this.controls.update();
	this.render();
};
