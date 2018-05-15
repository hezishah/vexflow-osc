// main.js

var controls;

var THREE = require('three')
   ,Vex = require('vexflow')
   ,RoundedBoxGeometry = require('three-rounded-box')(THREE) //pass your instance of three
   ,OBJLoader = require('three-obj-loader')
   ,OrbitControls = require('three-orbit-controls')(THREE);

  //, THREEx = require('threex');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.01);
scene.add(ambientLight);

controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Create a PointLight and turn on shadows for the light
var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( -10, 10, 0 );
light.castShadow = true;            // default false
scene.add( light );
//Set up shadow properties for the light
light.shadow.mapSize.width = 512;  // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5;       // default
light.shadow.camera.far = 500      // default

var geometry = new RoundedBoxGeometry( 4, 4, 4, 1, 16);
var material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true; //default is false
cube.receiveShadow = false; //default
scene.add( cube );

camera.position.z = 5;

//Create a helper for the shadow camera (optional)
var helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );

function animate() {
  requestAnimationFrame( animate );
  renderer.shadowMap.enabled = true;
  renderer.render( scene, camera );
  //controls.update();
}
animate();

VF = Vex.Flow;
var vexCanvas = document.createElement('canvas');
var vexRenderer = new VF.Renderer(vexCanvas, VF.Renderer.Backends.SVG);

// Size our svg:
vexRenderer.resize(500, 500);

// And get a drawing context:
var context = vexRenderer.getContext();
