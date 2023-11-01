import * as THREE from "../lib/three.module.js";
import { GLTFLoader } from "../lib/GLTFLoader.module.js";
// const loaderCol = new THREE.ColladaLoader();

let renderer, scene, camera, avion;
let score = 0;
let levelLabel;
let restartButton;
const movementSpeed = 6;
let isGameOver = false; // Variable para controlar si el juego ha terminado debido a una colisión
let muteado;
let speed = 1; // Velocidad inicial
const clouds = [];
const cloudCorridorWidth = 200; // Ancho del pasillo
const cloudCorridorLength = 500; // Largo del pasillo
const audio = new Audio("../videos/sound.mp3");
const audioBoton = new Audio("../videos/boton.mp3");
const audioGame = new Audio("../videos/sonido.mp3");

const minX = -100; // Valor mínimo de X
const maxX = 100; // Valor máximo de X
const minZ = -100; // Valor mínimo de Z
const maxZ = 100; // Valor máximo de Z

const maxMov = 50;
const minMov = -50;
// let cloudCount = 30;

let isGamePaused = false;

let tiempoJugado = 0; // Tiempo jugado en segundos
let generacionNubesInterval = 5000; // Intervalo de generación de nubes en milisegundos (por ejemplo, cada 5 segundos)
let etapaGeneracionNubes = 0; // Etapa actual de generación de nubes
let cantidadNubesEtapa = 5; // Cantidad de nubes a generar en cada etapa


function init() {
  

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("container").appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(156,500,300)");

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0.8, 22, -350);
    camera.lookAt(0, 10, -300);
    camera.far = 2000; // 
    camera.updateProjectionMatrix();


    // Inicializar sombras
    renderer.antialias = true;
    renderer.shadowMap.enabled = true;

    // Crea una fuente de luz ambiental
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color e intensidad
    scene.add(ambientLight);

    // Crea una fuente de luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color e intensidad
    directionalLight.position.set(1, 1, -1); // Posición de la luz
    scene.add(directionalLight);

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("keydown", onDocumentKeyDown);
}

function loadScene() {
    
    
    for (const cloud of clouds) {
        scene.remove(cloud);
    }
    clouds.length = 0;
    const material_suelo = new THREE.MeshBasicMaterial({ color: "rgb(156,223,255)", wireframe: false });
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(150, 1000), material_suelo);
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    scene.add(suelo);
    AudioMute()
    avion = createPlane();
    scene.add(avion);
    generarNubesAdicionales()
    setInterval(generarNubesAdicionales, generacionNubesInterval);

    // Crear nubes iniciales
    // for (let i = 0; i < cloudCount; i++) {
    //     createCloud();
    // }
    // const textureLoader = new THREE.TextureLoader();
    // const backgroundTexture = textureLoader.load("../images/cloud1.png");
    // const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture });
    // const backgroundGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    // const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    // backgroundMesh.scale.set(-1, 1, 1);
    // scene.add(backgroundMesh);

    letrero();
    audioGame.play();
}

function render() {
    if (isGamePaused) {
        return;
    }
    requestAnimationFrame(render);
    tiempoJugado += 1 / 120;
    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].position.z -= speed;

        if (clouds[i].position.z < -cloudCorridorLength) {
            scene.remove(clouds[i]);
            clouds.splice(i, 1);
            createCloud();
            score += 1;
            speed = 1;
        }
    }
    if (tiempoJugado >= etapaGeneracionNubes * 120) {
        etapaGeneracionNubes++;
        cantidadNubesEtapa += 5; // Aumenta la cantidad de nubes en la siguiente etapa
    }
    updateScoreLabel();
    checkCollisions();
    renderer.render(scene, camera);
}

function checkBounds() {
    avion.position.x = clamp(avion.position.x, minMov, maxMov);
}

function onDocumentKeyDown(event) {
    var tecla = event.key;

    if (tecla === "ArrowLeft") {
        TweenMax.to(avion.position, 0.3, { x: `+=${movementSpeed}`, onUpdate: checkBounds });
    }
    if (tecla === "ArrowRight") {
        TweenMax.to(avion.position, 0.3, { x: `-=${movementSpeed}`, onUpdate: checkBounds });
    }
}

function onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}

function createCloud() {
    const loader = new GLTFLoader();

    loader.load("../models/cloud/scene.gltf", function (gltf) {
        const cloud = gltf.scene;

        // Posiciona la nube de manera aleatoria
        const x = (Math.random() - 0.5) * cloudCorridorWidth;
        const y = (Math.random() - 0.5) * 2;
        let z;

        do {
            z = -Math.random() * -400 + 300; // Genera nubes en el rango (-300, -100) y (-100, 100)
        } while (z >= -100 && z <= 100); // Evita la posición donde está el avión
        cloud.rotation.x = Math.PI * 2;
        cloud.position.x = clamp(x, minX, maxX);
        cloud.position.z = clamp(z, minZ, maxZ);
        cloud.position.set(x, 10, z);
        cloud.rotation.y = Math.PI;
        cloud.scale.set(3, 3, 3); // Escala el modelo
        gltf.scene.traverse((ob) => {
            if (ob.isObject3D) ob.castShadow = true;
        });

        scene.add(cloud);
        clouds.push(cloud);
    });
}

function createPlane() {
    const loader = new GLTFLoader();
    loader.load("../models/cartoon_plane/scene.gltf", function (gltf) {
        avion = gltf.scene;
        avion.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                // Configura sombras para los objetos de malla del avión
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        avion.position.set(0, 10, -300);
        avion.scale.set(5, 5, 5); // Escala el modelo según sea necesario
        scene.add(avion);
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function letrero() {
    // Si el letrero del puntaje ya existe, no lo vuelvas a crear
    if (!levelLabel) {
        levelLabel = document.createElement('div');
        levelLabel.style.position = 'absolute';
        levelLabel.style.bottom = '20px'; // Ajusta la posición del letrero
        levelLabel.style.left = '50%'; // Ajusta la posición del letrero
        levelLabel.style.transform = 'translateX(-50%)'; // Centra horizontalmente
        levelLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        levelLabel.style.color = '#fff';
        levelLabel.style.fontSize = '24px';
        levelLabel.style.padding = '10px 20px';
        levelLabel.style.borderRadius = '5px';
        levelLabel.style.display = 'block'; // Inicialmente, el letrero está oculto
        document.body.appendChild(levelLabel);
    }
}
function checkCollisions() {
    for (let i = clouds.length - 1; i >= 0; i--) {
        const cloud = clouds[i];
        const collisionDistance = 10;

        if (distance(avion, cloud) < collisionDistance) {
            // Hubo una colisión entre el avión y la nube
            handleCollision();
            break;
        }
    }
}


function distance(obj1, obj2) {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const dz = obj1.position.z - obj2.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}


function handleCollision() {
    isGameOver = true;
    isGamePaused = true;
    audio.play();
    audioGame.pause()

    // Crea un botón con estilo retro solo si el juego ha terminado
    if (isGameOver) {
        restartButton = document.createElement("button");
        restartButton.innerText = "Reiniciar";
        restartButton.style.position = "absolute";
        restartButton.style.top = "50%";
        restartButton.style.left = "50%";
        restartButton.style.transform = "translate(-50%, -50%)";
        restartButton.style.padding = "10px 20px";
        restartButton.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        restartButton.style.color = "#fff";
        restartButton.style.fontFamily = "CC OVERBYTE, sans-serif";
        restartButton.style.border = "1px solid #fff";
        restartButton.style.borderRadius = "5px";
        restartButton.style.cursor = "pointer";
        restartButton.style.fontSize = "40px";
        restartButton.addEventListener("click", restartGame);

        document.body.appendChild(restartButton);
    }
}

function restartGame() {
    // Limpia la escena y el arreglo de nubes
    clouds.forEach((cloud) => {
        scene.remove(cloud);
    });
    clouds.length = 0;
    scene.remove(avion);

    audioBoton.play();

    // Restablece las variables de juego
    isGamePaused = false;
    isGameOver = false; // Reinicia la variable de juego
    score = 0;
    cantidadNubesEtapa = 0;
    etapaGeneracionNubes = 0;

    renderer.dispose();

    updateScoreLabel();

    // Elimina el botón de reinicio
    document.body.removeChild(restartButton);

    if (!audioGame.paused) {
        audioGame.pause();
        audioGame.currentTime = 0; // Reinicia la reproducción al principio
        audioGame.play();
    }

    loadScene();
    render();
}

function updateScoreLabel() {
    if (levelLabel) {
        levelLabel.textContent = `Puntos: ${score}`;
    }
}

function generarNubesAdicionales() {
    for (let i = 0; i < cantidadNubesEtapa; i++) {
        if (clouds.length < 50) { // Verifica si no has alcanzado el límite de 50 nubes
            createCloud();
        }
    }

    // Aumenta la cantidad de nubes en la siguiente etapa
    cantidadNubesEtapa += 5; // Puedes ajustar el aumento según tus preferencias
}

function AudioMute() {
    muteado = document.createElement("button");
    muteado.innerText = "Sound";
    muteado.style.position = "absolute";
    muteado.style.top = "20px"; // Ajusta la posición superior a 20px
    muteado.style.right = "20px"; // Ajusta la posición derecha a 20px
    muteado.style.padding = "10px 20px";
    muteado.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    muteado.style.color = "#fff";
    muteado.style.fontFamily = "CC OVERBYTE, sans-serif";
    muteado.style.border = "1px solid #fff";
    muteado.style.borderRadius = "5px";
    muteado.style.cursor = "pointer";
    muteado.style.fontSize = "10px";
    muteado.addEventListener("click", mute);

    document.body.appendChild(muteado);
}


function mute() {
    if (audioGame.muted) {
        audioGame.muted = false; // Habilita el sonido si está silenciado
    } else {
        audioGame.muted = true; // Deshabilita el sonido si no está silenciado
    }
}


init();
loadScene();
render();
