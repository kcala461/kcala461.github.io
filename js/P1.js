// Módulos necesarios
import * as THREE from "../lib/three.module.js"
import { OrbitControls } from "../lib/OrbitControls.module.js"

let renderer, scene, camera


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

    
    const controls = new OrbitControls(camera, renderer.domElement);

}

function loadScene() {
    // Material sencillo
    const material = new THREE.MeshNormalMaterial({
        transparent: true
        , opacity:1
         })
    const material_suelo = new THREE.MeshBasicMaterial({ color:'red', wireframe:false })


    //Suelo
    const suelo = new THREE.Mesh( new THREE.PlaneGeometry( 1000,1000), material_suelo )
    suelo.rotation.x = -Math.PI/2
    // suelo.rotation.y = -0.2
    scene.add( suelo )

    // Base cilindro
    const base_cilindro = new THREE.Mesh( new THREE.CylinderGeometry( 50,50,15,24), material)
    scene.add(base_cilindro)
    // base_cilindro.rotation.x = -0.1
    base_cilindro.position.y = 1

    // Base cilindro
    const base_brazo = new THREE.Mesh(new THREE.CylinderGeometry( 20,20,18,24), material)
    scene.add(base_brazo)
    base_brazo.position.x = 1
    base_brazo.rotation.x = Math.PI/2

    // Base esparrago
    const base_esparrago = new THREE.Mesh(new THREE.BoxGeometry(18,120,12), material)
    scene.add(base_esparrago)
    base_esparrago.position.y = 78

    // Base rotula
    const base_rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material)
    scene.add(base_rotula)
    base_rotula.position.y = 140

    // Base antebrazo
    const base_cilindro_antebrazo = new THREE.Mesh( new THREE.CylinderGeometry(22,22,6,24), material)
    scene.add(base_cilindro_antebrazo)
    base_cilindro_antebrazo.position.y = 140

    // Base columnas
    const columna_1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    scene.add(columna_1)
    columna_1.position.y = 183
    columna_1.position.x = 11

    const columna_2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    scene.add(columna_2)
    columna_2.position.y = 183
    columna_2.position.x = -11

    const columna_3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    scene.add(columna_3)
    columna_3.position.y = 183
    columna_3.position.z = -11

    const columna_4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), material)
    scene.add(columna_4)
    columna_4.position.y = 183
    columna_4.position.z = 11

    // Final antebrazo
    const final_antebrazo = new THREE.Mesh(new THREE.CylinderGeometry(15,15,40,24), material)
    scene.add(final_antebrazo)
    final_antebrazo.position.y = 223
    final_antebrazo.rotation.x = Math.PI/2

    // Pinzas
    const mano_1 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), material)
    mano_1.position.y = 223
    mano_1.position.z = 11
    mano_1.position.x = 11

    const mano_2 = new THREE.Mesh( new THREE.BoxGeometry(20,19,4), material)
    
    mano_2.position.y = 223
    mano_2.position.z = -11
    mano_2.position.x = 11


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
    dedo_1.position.y = 0
    dedo_1.position.z = 0
    dedo_1.position.x = 20
    dedo_1.rotation.y = 3*Math.PI/2

    mano_2.add(dedo_2)
    dedo_2.position.y = 0
    dedo_2.position.z = 0
    dedo_2.position.x = 20
    dedo_2.rotation.y = 3*Math.PI/2


    scene.add(mano_2)
    scene.add(mano_1)

}


function render() {
    requestAnimationFrame( render )
    update()
    renderer.render( scene, camera )
}

// Acciones
init()
loadScene()
render()
