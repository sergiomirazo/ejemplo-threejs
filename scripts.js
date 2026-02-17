import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // Configuración de productos
        // Nota: Usamos modelos de GitHub raw que suelen tener mejores políticas CORS
        const products = [
            { 
                id: 'canvas-1', 
                statusId: 'status-1',
                url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Chair/glTF-Binary/Chair.glb',
                fallback: 'box' 
            },
            { 
                id: 'canvas-2', 
                statusId: 'status-2',
                url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Astronaut/glTF-Binary/Astronaut.glb',
                fallback: 'sphere' 
            },
            { 
                id: 'canvas-3', 
                statusId: 'status-3',
                url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/RobotExpressive/glTF-Binary/RobotExpressive.glb',
                fallback: 'torus' 
            }
        ];

        function createFallbackGeometry(type) {
            const material = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0xffffff,
                roughness: 0.3,
                metalness: 0.7
            });

            switch(type) {
                case 'box':
                    return new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), material);
                case 'sphere':
                    return new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);
                case 'torus':
                    return new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.3, 100, 16), material);
                default:
                    return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
            }
        }

        function init3DScene(containerId, statusId, modelUrl, fallbackType) {
            const container = document.getElementById(containerId);
            const statusBadge = document.getElementById(statusId);
            
            const width = container.clientWidth;
            const height = container.clientHeight;

            // Escena
            const scene = new THREE.Scene();
            
            // Cámara
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
            camera.position.set(0, 0, 5);

            // Renderizador
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            container.appendChild(renderer.domElement);

            // Luces
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1);
            dirLight.position.set(5, 5, 5);
            dirLight.castShadow = true;
            scene.add(dirLight);

            const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
            backLight.position.set(-5, 0, -5);
            scene.add(backLight);

            // Controles
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2;

            let model = null;

            // Cargar Modelo
            const loader = new GLTFLoader();
            loader.load(
                modelUrl,
                (gltf) => {
                    model = gltf.scene;
                    
                    // Auto-escalar modelo
                    const box = new THREE.Box3().setFromObject(model);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2.5 / maxDim;
                    model.scale.setScalar(scale);
                    
                    // Centrar modelo
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center.multiplyScalar(scale));
                    model.position.y = -0.5;

                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    scene.add(model);
                    statusBadge.textContent = '✓ Modelo 3D';
                    statusBadge.className = 'status-badge status-ok';
                    console.log(`✅ Modelo cargado en ${containerId}`);
                },
                undefined,
                (error) => {
                    console.warn(`⚠️ Falló carga externa en ${containerId}, usando fallback.`, error);
                    model = createFallbackGeometry(fallbackType);
                    model.position.y = 0;
                    scene.add(model);
                    statusBadge.textContent = '⚡ Fallback Activo';
                    statusBadge.className = 'status-badge status-fallback';
                }
            );

            // Loop de animación
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();

            // Resize handler
            const resizeObserver = new ResizeObserver(() => {
                const newWidth = container.clientWidth;
                const newHeight = container.clientHeight;
                renderer.setSize(newWidth, newHeight);
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
            });
            resizeObserver.observe(container);

            return { scene, camera, renderer };
        }

        // Inicializar todos los productos
        products.forEach(product => {
            init3DScene(
                product.id, 
                product.statusId, 
                product.url, 
                product.fallback
            );
        });

        console.log('🚀 Tienda 3D inicializada correctamente');
