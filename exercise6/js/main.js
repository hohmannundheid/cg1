/**
 * Inspired by https://github.com/mrdoob/three.js/blob/master/examples/webgl_effects_anaglyph.html
 */
"use strict"

function main() {
    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    window.onresize = function(event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        effect.setSize( window.innerWidth, window.innerHeight );
    }

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

    var effect;
    var anaglyph = new THREE.AnaglyphEffect(renderer);
    var stereoscopic = new THREE.StereoEffect(renderer);
    var setupEffect = function() {
        if (effect === undefined || params.effect === 'anaglyph') {
            effect = anaglyph;
        } else {
            effect = stereoscopic;
        }
        effect.setSize(window.innerWidth, window.innerHeight);
    };
    setupEffect();

    var spheres = [];
    var setupScene = function() {
        // Setup textures for environment mapping
        var loader = new THREE.TextureLoader();
        loader.load('textures/gallery.jpg', function(texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;

            var rectShader = THREE.ShaderLib['equirect'];
            var material = new THREE.ShaderMaterial({
                fragmentShader: rectShader.fragmentShader,
                vertexShader: rectShader.vertexShader,
                uniforms: rectShader.uniforms,
                depthWrite: false,
                side: THREE.BackSide
            });

            material.uniforms['tEquirect'].value = texture;

            var cube = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), material);
            scene.add(cube);

            var sphereGeom = new THREE.SphereBufferGeometry(0.6, 48, 24);
            var sphereMaterial = new THREE.MeshBasicMaterial({envMap: texture});
            for (var i = 0; i < 100; i++) {
                var sphere = new THREE.Mesh(sphereGeom, sphereMaterial);
                sphere.position.x = Math.random() * 10 - 5;
                sphere.position.y = Math.random() * 10 - 5;
                sphere.position.z = Math.random() * 10 - 5;

                scene.add(sphere);
                spheres.push(sphere);
            }
        });
    };
    setupScene();

    var render = function() {
        if (spheres.length > 0) {
            var time = 0.0001 * Date.now();
            for (var i = 0; i < spheres.length; i++) {
                var sphere = spheres[i];
                sphere.position.x = 5 * Math.sin(time + i * 1.1);
                sphere.position.y = 5 * Math.cos(time + i);
            }
        }
        effect.render(scene, camera);
    };

    // Start animation loop
    var animate = function() {
        requestAnimationFrame(animate);
        controls.update();
        render();
    };
    animate();
}
