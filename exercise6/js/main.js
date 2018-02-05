"use strict"

function main() {
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    var effect;
    var setupEffect = function() {
        if (effect === undefined || params.effect === 'anaglyph') {
            effect = new THREE.AnaglyphEffect(renderer);
        } else {
            effect = new THREE.StereoEffect(renderer);
        }
        effect.setSize(window.innerWidth, window.innerHeight);
    };
    setupEffect();

    var gui = new dat.GUI();
    var params;
    var setupGUI = function() {
        params = {
            effect: 'anaglyph'
        };

        var options = ['anaglyph', 'stereoscopic'];
        gui.add(params, 'effect', options).name('Effect').onChange(function(newValue){setupEffect();});

        gui.open();
    };
    setupGUI();

    var setupScene = function() {
        // Setup textures for environment mapping
        var envTexture = new THREE.TextureLoader().load('textures/gallery.jpg');
        envTexture.mapping = THREE.EquirectangularReflectionMapping;
        envTexture.magFilter = THREE.LinearFilter;
        envTexture.minFilter = THREE.LinearMipMapLinearFilter;

        var rectShader = THREE.ShaderLib['equirect'];
        var material = new THREE.ShaderMaterial({
            fragmentShader: rectShader.fragmentShader,
            vertexShader: rectShader.vertexShader,
            uniforms: rectShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        });

        material.uniforms['tEquirect'].value = envTexture;

        var cubeMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), material);
        scene.add(cubeMesh);

        var geometry = new THREE.SphereBufferGeometry(0.6, 48, 24);
        var sphereMaterial = new THREE.MeshLambertMaterial({envMap: envTexture});
        var sphere = new THREE.Mesh(geometry, sphereMaterial);
        scene.add(sphere);
    };
    setupScene();

    var controls;
    var setupControls = function() {
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 3.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
        controls.keys = [65, 83, 68];
        controls.minDistance = 0.1;
        controls.maxDistance = 10;
    };
    setupControls();

    // Start animation loop
    var animate = function() {
        requestAnimationFrame(animate);
        controls.update();
        effect.render(scene, camera);
    };
    animate();
}
