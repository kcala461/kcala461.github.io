// Módulos necesarios
import * as THREE from "../lib/three.module.js"
import { OrbitControls } from "../lib/OrbitControls.module.js"
import { TWEEN } from "../lib/tween.module.min.js";
import{GUI} from "../lib/lil-gui.module.min.js"


let renderer, scene, camera, robot, effectController,suelo,brazo,antebrazo, rotula,  mano, mano_1, mano_2, base_cilindro;

const movementSpeed  = 10;

// camara
let cenital, L



// Funciones
function init() {
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight )
    // renderer.setClearColor(0xFFFFFF)
    renderer.autoClear = false
    document.getElementById( 'container' ).appendChild( renderer.domElement )

    // Instanciar el nodo raíz de la escena
    scene = new THREE.Scene()
    // scene.background = new THREE.Color( 0.5, 0.5, 0.5 )

    //inicializar sombras
    renderer.antialias =true
    renderer.shadowMap.enabled=true

    // Instanciar la cámara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    camera.position.set( 0.5, 400, 200 )
    camera.lookAt( 0, 1, 0 ) 
    camera.far = 7000


        // Luces: ambiente, direccional y focal
        const ambiental = new THREE.AmbientLight(0x222222);
        scene.add(ambiental);
    
        const direccional = new THREE.DirectionalLight(0xFFFFFF,0.8);
        direccional.position.set(-150,350,-150);
        direccional.castShadow = true;
        // helperDirec = new THREE.CameraHelper(direccional.shadow.camera);
        // scene.add(helperDirec);
        scene.add(direccional);
    
        const focal = new THREE.SpotLight(0xFFFFFF,0.3);
        focal.position.set(-150,350,150);
        focal.target.position.set(0,0,0);
        focal.angle = Math.PI/4;
        focal.penumbra = 0.3;
        focal.castShadow = true;
        focal.shadow.camera.far = 1000;
        // helperFocal = new THREE.CameraHelper(focal.shadow.camera);
        // scene.add(helperFocal);
        scene.add(focal);

     
    const controls = new OrbitControls(camera, renderer.domElement);

    // Camaras 
    L = Math.min(window.innerWidth, window.innerHeight) / 4;
    camaraCenital();

    // Captura eventos
    window.addEventListener('resize', updateAspectRatio);
    // renderer.domElement.addEventListener('dblclick',animate)
    document.addEventListener('keydown', onDocumentKeyDown);

}

function loadScene() {


    // Material sencillo
    const material = new THREE.MeshNormalMaterial({
        transparent: true
        , opacity:1
         })
    // const material_suelo = new THREE.MeshStandardMaterial({ color:'red' })
    const path="./js/"
    
    const texSuelo =new THREE.TextureLoader().load('./js/piso.jpg')
    texSuelo.repeat.set(4,3)
    texSuelo.wrapS=texSuelo.wrapT = THREE.RepeatWrapping

    const texBrazo =new THREE.TextureLoader().load('./js/bronce.jpg')
    const texAntebrazo =new THREE.TextureLoader().load('./js/metal_128.jpg')
    const texPinza =new THREE.TextureLoader().load('./js/oro.jpg')

    const matsuelo = new THREE.MeshStandardMaterial({color:"rgb(150,150,150)",map:texSuelo})
    const matBrazo = new THREE.MeshLambertMaterial({color:"rgb(150,150,150)",map:texBrazo})
    const matAntebrazo = new THREE.MeshPhongMaterial({color:"rgb(150,150,150)",map:texAntebrazo})
    const matPinza = new THREE.MeshPhongMaterial({color:"rgb(150,150,150)",map:texPinza})


    const entorno = [
        path+"posx.jpg",path+"negx.jpg",
        path+"posy.jpg",path+"negy.jpg",
        path+"posz.jpg",path+"negz.jpg",
    ]
 
    const texRotula= new THREE.CubeTextureLoader().load(entorno)
    const mateRotula = new THREE.MeshPhongMaterial({color:"white",specular:"gray",shininess:30,envMap:texRotula})





    //Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry( 1000,1000), matsuelo )
    suelo.rotation.x = -Math.PI/2
    // suelo.rotation.y = -0.2
    suelo.receiveShadow=true
    scene.add( suelo )
    

    // Base cilindro
    base_cilindro = new THREE.Mesh( new THREE.CylinderGeometry( 50,50,15,24), matBrazo)
    base_cilindro.castShadow=base_cilindro.receiveShadow=true

    // base_cilindro.rotation.x = -0.1
    // base_cilindro.position.y = 1

    // Se crea el brazo
    brazo = new THREE.Group();

    // Base cilindro
    const eje = new THREE.Mesh(new THREE.CylinderGeometry( 20,20,18,24), matBrazo)
    eje.position.x = 1
    eje.rotation.x = Math.PI/2
    eje.castShadow=eje.receiveShadow=true
    brazo.castShadow=brazo.receiveShadow=true

    brazo.add(eje)


    // Base esparrago
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12), matBrazo)
    esparrago.position.y = 78
    esparrago.castShadow=esparrago.receiveShadow=true
    brazo.castShadow=esparrago.receiveShadow=true
    brazo.add(esparrago)


    // Base rotula
    rotula = new THREE.Mesh(new THREE.SphereGeometry(20), mateRotula)
    rotula.position.y = 140
    rotula.castShadow=rotula.receiveShadow=true
    brazo.castShadow=brazo.receiveShadow=true

    brazo.add(rotula)

    // Crea antebrazo
    antebrazo = new THREE.Group();
    antebrazo.position.y=140
    
    // Base antebrazo
    const disco = new THREE.Mesh( new THREE.CylinderGeometry(22,22,6,24), matAntebrazo)
    disco.castShadow=disco.receiveShadow=true
    antebrazo.castShadow=antebrazo.receiveShadow=true

    antebrazo.add(disco)

    // Base columnas

    const columna_1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), matAntebrazo)
    columna_1.position.y = 43
    columna_1.position.x = 11
    columna_1.castShadow=columna_1.receiveShadow=true


    const columna_2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), matAntebrazo)
    columna_2.position.y = 43
    columna_2.position.x = -11
    columna_2.castShadow=columna_2.receiveShadow=true


    const columna_3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), matAntebrazo)
    columna_3.position.y = 43
    columna_3.position.z = -11
    columna_3.castShadow=columna_3.receiveShadow=true


    const columna_4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), matAntebrazo)
    columna_4.position.y = 43
    columna_4.position.z = 11
    columna_4.castShadow=columna_4.receiveShadow=true


    antebrazo.add(columna_1)
    antebrazo.add(columna_2)
    antebrazo.add(columna_3)
    antebrazo.add(columna_4)

    // Final antebrazo


    // Inicio mano
    mano = new THREE.Group();
    mano.position.y=90

    mano.castShadow=mano.receiveShadow=true

    const palma = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,24), matAntebrazo)
    mano.add(palma)
    
    palma.castShadow=palma.receiveShadow=true

    palma.rotation.x = Math.PI/2

    
    // Pinzas
    mano_1 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), matPinza)
    // palma.add(mano_1)
    mano_1.position.y = 0
    mano_1.position.z = 15
    mano_1.position.x = 10
    mano_1.castShadow=mano_1.receiveShadow=true
    
    // mano_1.rotation.x=Math.PI/2

    mano_2 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), matPinza)
    // palma.add(mano_2)
    // mano_2.position.y = -10
    // mano_2.position.z = 0
    // mano_2.position.x = 10
    // mano_2.rotation.x=Math.PI/2
    mano_2.position.y = 0
    mano_2.position.z = -15
    mano_2.position.x = 10
    mano_2.castShadow=mano_2.receiveShadow=true

    // mano_2.rotation.x=Math.PI/2


    const dedo = new THREE.BufferGeometry();
        
    const coordenadas = new Float32Array( [
        2,-9.5,10,  // esquina inf izq del
        2,-5,-10, // esquina inf der del
        2,5,-10, // esquina sup der del
        2,9.5,10, // esquina sup izq del
        -2,9.5,10, // esquina sup izq tra
        -2,5,-10, // esquina sup der tra
        -2,-5,-10, // esquina inf der tra
        -2,-9.5,10 //// esquina inf izq tra
    ])

    const indices = [
    0,3,7, 7,3,4, 0,1,2,
    0,2,3, 4,3,2, 4,2,5,
    6,7,4, 6,4,5, 1,5,2,
    1,6,5, 7,6,1, 7,1,0
    ]

    dedo.setIndex(indices)
    dedo.setAttribute('position', new THREE.BufferAttribute(coordenadas,3))
    dedo.computeVertexNormals();

    const dedo_1 = new THREE.Mesh(dedo, matPinza)
    const dedo_2 = new THREE.Mesh(dedo, matPinza)
    dedo_1.castShadow=dedo_1.receiveShadow=true
    dedo_2.castShadow=dedo_2.receiveShadow=true



    mano_1.add(dedo_1)
    dedo_1.position.x = 20
    dedo_1.rotation.y = 3*Math.PI/2

    mano_2.add(dedo_2)
    dedo_2.position.x = 20
    dedo_2.rotation.y = 3*Math.PI/2

    mano.add(mano_1)
    mano.add(mano_2)


    robot = new THREE.Object3D();
    robot.name  = 'robot'

    antebrazo.add(mano);
    brazo.add(antebrazo);
    base_cilindro.add(brazo);
    robot.add(base_cilindro);
    robot.castShadow=robot.receiveShadow=true


    scene.add(robot);

    const parades=[]
    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
    map: new THREE.TextureLoader().load(path+"posx.jpg")}))

    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
        map: new THREE.TextureLoader().load(path+"negx.jpg")}))
    
    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
            map: new THREE.TextureLoader().load(path+"posy.jpg")}))
    
    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
    map: new THREE.TextureLoader().load(path+"negy.jpg")}))
    
    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
        map: new THREE.TextureLoader().load(path+"posz.jpg")}))
    
    parades.push(new THREE.MeshBasicMaterial({side:THREE.BackSide,
            map: new THREE.TextureLoader().load(path+"negz.jpg")}))

    const habitacion = new THREE.Mesh(new THREE.BoxGeometry(1000,1000,1000),parades)

    scene.add(habitacion)
    
}


function render()
{
    requestAnimationFrame(render);
    // renderer.clear();

    update();
    let side;
    
    const ar = window.innerWidth / window.innerHeight;
    if(ar < 1) 
        side = window.innerWidth/4;
    else
        side = window.innerHeight/4;

    renderer.setViewport(0,0, window.innerWidth,window.innerHeight);
    renderer.render(scene, camera);
    renderer.setViewport(0, (window.innerHeight - side), side,side);
    renderer.render(scene, cenital);



}

function animate(){
    //capturar y normalizar
   
    new TWEEN.Tween(brazo.rotation).
    to({x:[0,0], y:[0,0], z:[Math.PI*4]}, 9000).
    interpolation(TWEEN.Interpolation.Linear).start()

    new TWEEN.Tween(antebrazo.rotation).
    to({x:[0,0], y:[0,0], z:[Math.PI/2]}, 9000).
    interpolation(TWEEN.Interpolation.Bezier).start()

    new TWEEN.Tween(antebrazo.rotation).
    to({x:[0,0], y:[0,0], z:[Math.PI/2,0]}, 9000).
    interpolation(TWEEN.Interpolation.Bezier).start()
 
    new TWEEN.Tween(mano.rotation).
    to({x:[0,0], y:[0,0], z:[-Math.PI*2]}, 9000).
    interpolation(TWEEN.Interpolation.Bezier).start()

    new TWEEN.Tween(mano_1.position).
    to({x:[0,0], y:[0,0], z:[10,0,10]}, 9000).
    interpolation(TWEEN.Interpolation.Linear).start()

    new TWEEN.Tween(mano_2.position).
    to({x:[0,0], y:[0,0], z:[-10,0,-10]}, 9000).
    interpolation(TWEEN.Interpolation.Linear).start()
}


function onDocumentKeyDown() {
    var tecla = event.key;
    if (tecla === 'ArrowUp') {
        robot.position.z -= movementSpeed;
    }
    if (tecla === 'ArrowDown') {
        robot.position.z += movementSpeed;
    }
    if (tecla === 'ArrowLeft') {
        robot.position.x -= movementSpeed;
    }
    if (tecla === 'ArrowRight') {
        robot.position.x += movementSpeed;
    }
};



function setUpGUI(){

    // Definicón de los controles

    effectController = {
      
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAntebrazoY: 0.0,
        giroAntebrazoX: 0.0,
        giroPinza: 0.0,
        separacionPinza: 5, 
        alambres:false,
        animacion: animate

    }

    const gui = new GUI()

    const h = gui.addFolder("Control")
    h.add(effectController, "giroBase", -180.0, 180.0, 0.025).name('Giro base')
    h.add(effectController, "giroBrazo", -45.0, 45.0, 0.025).name('Giro brazo')
    h.add(effectController, "giroAntebrazoY", -180.0, 180.0, 0.025).name('Giro antebrazo Y')
    h.add(effectController, "giroAntebrazoX", -90.0, 90.0, 0.025).name('Giro antebrazo X')
    h.add(effectController, "giroPinza", -40.0, 220.0, 0.025).name('Giro pinza')
    h.add(effectController, "separacionPinza", 0.0, 15.0, 0.025).name('Separación pinza')
    h.add(effectController, "alambres").name('Alambres')
    h.add(effectController, "animacion").name('Animar')
}

function update()
{
    base_cilindro.rotation.y = effectController.giroBase*Math.PI/180
    brazo.rotation.z = effectController.giroBrazo*Math.PI/180
    antebrazo.rotation.y = effectController.giroAntebrazoY*Math.PI/180
    antebrazo.rotation.x = effectController.giroAntebrazoX*Math.PI/180
    mano.rotation.z = effectController.giroPinza*Math.PI/180
    mano.rotation.z = effectController.giroPinza*Math.PI/180

    mano_1.position.z = effectController.separacionPinza
    mano_2.position.z = -effectController.separacionPinza
    base_cilindro.material.wireframe = effectController.alambres
    TWEEN.update();
}


function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ar = window.innerWidth / window.innerHeight;

    camera.aspect = ar;
    camera.updateProjectionMatrix();

    L = Math.min(window.innerWidth, window.innerHeight) / 4;

    cenital.left = -L/4;
    cenital.right = L/4;
    cenital.bottom = -L/4;
    cenital.top = L/4;

    cenital.updateProjectionMatrix();
}

function camaraCenital() {
    const camaraOrto = new THREE.OrthographicCamera(-L/4, L/4, L/4, -L/4, -10, 300)

    cenital = camaraOrto.clone();
    cenital.position.set(0,250,0);
    cenital.lookAt(0,0,0);
    cenital.up = new THREE.Vector3(0,0,-1); 
}



// Acciones
init();
loadScene();
setUpGUI();
render();
