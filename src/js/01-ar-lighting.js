import * as THREE from 'three';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {ARButton} from "three/examples/jsm/webxr/ARButton";
import {XREstimatedLight} from "three/examples/jsm/webxr/XREstimatedLight";

let camera, scene, renderer
let controller
let defaultEnvironment

init()
animate()

function init() {
    // DOM容器
    const container = document.createElement('div')
    document.body.appendChild(container)

    // 场景
    scene = new THREE.Scene()

    // 相机
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20)

    // 灯光
    const defaultLight = new THREE.HemisphereLight(0xFFFFFF, 0xBBBBFF, 1)
    defaultLight.position.set(0.5, 1, 0.25)
    scene.add(defaultLight)

    // 渲染器
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.physicallyCorrectLights = true
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)

    // XR灯光
    const xrLight = new XREstimatedLight(renderer)
    xrLight.addEventListener('estimationstart', () => {
        scene.add(xrLight)
        scene.remove(defaultLight)

        if (xrLight.environment) {
            scene.environment = xrLight.environment
        }

        xrLight.addEventListener('estimationend', () => {
            scene.add(defaultLight)
            scene.remove(xrLight)

            scene.environment = defaultEnvironment
        })
    })

    // RGBELoader
    new RGBELoader().setPath('../../assets/images/equirectangular/').load('royal_esplanade_1k', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping
        defaultEnvironment = texture
        scene.environment = defaultEnvironment
    })

    document.body.appendChild(ARButton.createButton(renderer, {optionalFeatures: ['light-estimation']}))

    // 模型
    const ballGeometry = new THREE.SphereBufferGeometry(0.175, 32, 32)
    const ballGroup = new THREE.Group()
    ballGroup.position.z = -2

    const rows = 3
    const cols = 3

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const ballMaterial = new THREE.MeshStandardMaterial({
                color: 0xDDDDDD,
                roughness: i / rows,
                metalness: j / cols
            })

            const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial)
            ballMesh.position.set((i + 0.5 - rows * 0.5) * 0.4, (j + 0.5 - cols * 0.5) * 0.4, 0)
            ballGroup.add(ballMesh)
        }
    }

    scene.add(ballGroup)

    // controller
    // controller=renderer.xr.getController(0)

    window.addEventListener('resize', onWindowResize)

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate() {
    renderer.setAnimationLoop(render)
}

function render() {
    renderer.render(scene, camera)
}
