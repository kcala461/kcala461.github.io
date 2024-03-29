// Módulos necesarios
// import * as THREE from "../lib/three.module.js"
import * as THREE  from "three"

let renderer, scene, camera, robot,suelo,brazo,antebrazo, rotula,  mano, mano_1, mano_2, base_cilindro;


// Funciones
function init() {
    // Instanciar el motor de render
    renderer = new THREE.WebGLRenderer()
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.getElementById( 'container' ).appendChild( renderer.domElement )

    // Instanciar el nodo raíz de la escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0.5, 0.5, 0.5 )

    // Instanciar la cámara
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 )
    camera.position.set( 0.5, 300, 300 )
    // camera.position.set( 0.5, 50 , 50 )
    camera.lookAt( 0, 1, 1 ) 

    

}

function loadScene() {


    // Material sencillo
    const material = new THREE.MeshNormalMaterial({
        transparent: true
        , opacity:1
         })
    const material_suelo = new THREE.MeshBasicMaterial({ color:'red', wireframe:false })


    //Suelo
    suelo = new THREE.Mesh( new THREE.PlaneGeometry( 1000,1000), material_suelo )
    suelo.rotation.x = -Math.PI/2
    // suelo.rotation.y = -0.2
    scene.add( suelo )
    

    // Base cilindro
    base_cilindro = new THREE.Mesh( new THREE.CylinderGeometry( 50,50,15,24), material)
    // base_cilindro.rotation.x = -0.1
    // base_cilindro.position.y = 1

    // Se crea el brazo
    brazo = new THREE.Group();

    // Base cilindro
    const eje = new THREE.Mesh(new THREE.CylinderGeometry( 20,20,18,24), material)
    eje.position.x = 1
    eje.rotation.x = Math.PI/2
    brazo.add(eje)


    // Base esparrago
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12), material)
    esparrago.position.y = 78
    brazo.add(esparrago)


    // Base rotula
    rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material)
    rotula.position.y = 140
    brazo.add(rotula)

    // Crea antebrazo
    antebrazo = new THREE.Group();
    antebrazo.position.y=140
    
    // Base antebrazo
    const disco = new THREE.Mesh( new THREE.CylinderGeometry(22,22,6,24), material)

    antebrazo.add(disco)

    // Base columnas

    const columna_1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    columna_1.position.y = 43
    columna_1.position.x = 11

    const columna_2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    columna_2.position.y = 43
    columna_2.position.x = -11

    const columna_3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    columna_3.position.y = 43
    columna_3.position.z = -11

    const columna_4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    columna_4.position.y = 43
    columna_4.position.z = 11

    antebrazo.add(columna_1)
    antebrazo.add(columna_2)
    antebrazo.add(columna_3)
    antebrazo.add(columna_4)

    // Final antebrazo


    // Inicio mano
    mano = new THREE.Group();
    mano.position.y=90


    const palma = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,24), material)
    mano.add(palma)

    palma.rotation.x = Math.PI/2

    
    // Pinzas
    mano_1 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), material)
    // palma.add(mano_1)
    mano_1.position.y = 0
    mano_1.position.z = 15
    mano_1.position.x = 10
    // mano_1.rotation.x=Math.PI/2

    mano_2 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), material)
    // palma.add(mano_2)
    // mano_2.position.y = -10
    // mano_2.position.z = 0
    // mano_2.position.x = 10
    // mano_2.rotation.x=Math.PI/2
    mano_2.position.y = 0
    mano_2.position.z = -15
    mano_2.position.x = 10
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

    const dedo_1 = new THREE.Mesh(dedo, material)
    const dedo_2 = new THREE.Mesh(dedo, material)


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

    scene.add(robot);

}

function render() {
    requestAnimationFrame( render )
    renderer.render( scene, camera )
}

// Acciones
init()
loadScene()
render()
