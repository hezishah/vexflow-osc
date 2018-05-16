// main.js

var controls;

var button = document.createElement("BUTTON");
button.innerText = "Full Screen";
var bVisible = true;
button.onclick = function full() {
  button.remove();
  THREEx.FullScreen.request();
  $("body").css('cursor', 'none');
};
document.addEventListener('webkitfullscreenchange', function(e) {
  showHide(e);
}, false);
document.addEventListener('mozfullscreenchange', function(e) {
  showHide(e);
}, false);
document.addEventListener('fullscreenchange', function(e) {
  showHide(e);
}, false);
function showHide(e) {
  var b = document.getElementById('fullscreen');
  if(!bVisible)
  {
    document.body.prepend( button );
    $("body").css('cursor', '');
  }
  bVisible = !bVisible;
}
document.body.appendChild( button );

var THREE = require('three')
   ,Vex = require('vexflow')
   ,RoundedBoxGeometry = require('three-rounded-box')(THREE) //pass your instance of three
   ,OBJLoader = require('three-obj-loader')
   ,OrbitControls = require('three-orbit-controls')(THREE)
   ,$ = require('jquery');

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

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//Create a PointLight and turn on shadows for the light
var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 0, 10, 5 );
light.castShadow = true;            // default false
scene.add( light );
//Set up shadow properties for the light
light.shadow.mapSize.width = 512;  // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5;       // default
light.shadow.camera.far = 500      // default

var geometry = new RoundedBoxGeometry( 3, 3, 3, .1, 16);
var material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
cube.castShadow = true; //default is false
cube.receiveShadow = false; //default
scene.add( cube );

camera.position.z = 5;

//Create a helper for the shadow camera (optional)
//var helper = new THREE.CameraHelper( light.shadow.camera );
//scene.add( helper );

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
// Create a stave at position 10, 40 of width 400 on the canvas.
var stave = new VF.Stave(10, 40, 400);

// Add a clef and time signature.
stave.addClef("treble").addTimeSignature("4/4");

// Connect it to the rendering context and draw!
stave.setContext(context).draw();