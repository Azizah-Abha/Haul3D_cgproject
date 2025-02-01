import * as THREE from 'https://unpkg.com/three@0.143.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.143.0/examples/jsm/controls/OrbitControls.js';

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-1, 3, 7);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Light
const ambientLight = new THREE.AmbientLight('white', 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 1);
directionalLight.position.set(-3, 5, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();

// Create truck body
const bodyGeometry = new THREE.BoxGeometry(4, 2.5, 2);
const bodyTextures = [
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/back.jpg') }),   // Front
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/newbody.jpg') }), // Back
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/truck-top.jpg') }), // Top
    new THREE.MeshPhongMaterial({ color: 0x000000 }),                                   // Bottom (black)
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/newbody.jpg') }), // Left
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/newbody.jpg') })  // Right
];

const bodyMesh = new THREE.Mesh(bodyGeometry, bodyTextures);
bodyMesh.position.set(0, 1.5, 0); // Adjusted position
bodyMesh.castShadow = true;
scene.add(bodyMesh);


// Create truck cabin
const cabinGeometry = new THREE.BoxGeometry(2, 2, 2);
const cabinTextures = [
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cabin.jpg') }), // Front
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cabin.jpg') }),  // Back
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cabin_head.jpg') }),   // Top
    new THREE.MeshPhongMaterial({ color: 0x000000 }),                                       // Bottom (black)
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cabin_left.jpg') }),  // Left
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/cabin_right.jpg') })  // Right
];
const cabinMesh = new THREE.Mesh(cabinGeometry, cabinTextures);
cabinMesh.position.set(-3, 1.5, 0); // Move cabin 1.5 units above the ground
cabinMesh.castShadow = true;
scene.add(cabinMesh);



// Load road texture
const roadTexture = textureLoader.load('./textures/road_bg.jpg', () => {
    roadTexture.minFilter = THREE.LinearFilter;
    roadTexture.magFilter = THREE.LinearFilter;
    const roadMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshLambertMaterial({ map: roadTexture, side: THREE.DoubleSide })
    );
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
});

// Create truck wheels
const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32, 1, false);

// Load textures
const wheelTextures = [
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/wheel_side.jpg') }), // Side
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/wheel_top.jpg') }),  // Top face
    new THREE.MeshPhongMaterial({ map: textureLoader.load('./textures/wheel_bottom.jpg') })  // Bottom face
];

// Create materials for each side of the wheel
const wheelMaterialArray = [
    wheelTextures[0], // Side
    wheelTextures[1], // Top face
    wheelTextures[2]  // Bottom face
];

const wheels = [];

const wheelPositions = [
    { x: -2.5, y: 0.5, z: 1 },   // front left
    { x: -2.5, y: 0.5, z: -1 },  // front right
    { x: 1.3, y: 0.5, z: 1 },    // back left
    { x: 1.3, y: 0.5, z: -1 }    // back right
];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterialArray);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos.x, pos.y, pos.z);
    wheel.castShadow = true;
    wheels.push(wheel);
    scene.add(wheel);
})

// Vertex Shader
const vertexShader = `
    varying vec3 vNormal;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader
const fragmentShader = `
    varying vec3 vNormal;
    void main() {
        float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
        gl_FragColor = vec4(0.5, 0.5, 1.0, 1.0) * intensity;
    }
`;
// Shader Material for Truck Body
const customShaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});


// // Animate
// function animate() {
//     requestAnimationFrame(animate);
//     updateCameraPosition();
//     controls.update(); // Update OrbitControls
//     renderer.render(scene, camera);
// }

// // Animation function
// function animate() {
//     requestAnimationFrame(animate);

//     // Rotate wheels
//     wheels.forEach(wheel => {
//         wheel.rotation.y += 0.05; // Example rotation speed (adjust as needed)
//     });

//     // Render scene
//     renderer.render(scene, camera);
// }

// // Start animation
// animate();

// Mouse interaction to rotate wheels and stop auto rotation
window.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX / window.innerWidth * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Rotate wheels based on mouse movement
    wheels.forEach(wheel => {
        wheel.rotation.y = mouseX * Math.PI;
    });

    // Stop auto rotation
    cancelAnimationFrame(animationId); // Stop the animation loop
});

let animationId = null;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // // Rotate wheels
    // wheels.forEach(wheel => {
    //     wheel.rotation.y += 0.05; // Adjust rotation speed as needed
    // });

    // Animate light position (example: rotate around the truck)
    const time = performance.now() * 0.001;
    directionalLight.position.x = Math.sin(time) * 5;
    directionalLight.position.z = Math.cos(time) * 5;

    // Update controls
    controls.update();

    // Render scene
    renderer.render(scene, camera);
}

animate();


