
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface STLViewerProps {
  fileUrl: string;
}

const STLViewer = ({ fileUrl }: STLViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl || !viewerRef.current) return;

    const loadSTLViewer = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clear previous content
        viewerRef.current!.innerHTML = '';

        // Set up scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // Set up camera
        const camera = new THREE.PerspectiveCamera(
          75,
          viewerRef.current!.clientWidth / viewerRef.current!.clientHeight,
          0.1,
          1000
        );

        // Set up renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(viewerRef.current!.clientWidth, viewerRef.current!.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        viewerRef.current!.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Set up controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        // Load STL file
        const loader = new STLLoader();
        
        loader.load(
          fileUrl,
          (geometry) => {
            // Center the geometry
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox!.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            // Create material and mesh
            const material = new THREE.MeshPhongMaterial({
              color: 0x666666,
              specular: 0x111111,
              shininess: 200
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            scene.add(mesh);

            // Position camera based on object size
            geometry.computeBoundingBox();
            const box = geometry.boundingBox!;
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = maxDim / (2 * Math.tan(fov / 2));
            cameraZ *= 1.5; // Add some padding

            camera.position.set(cameraZ, cameraZ, cameraZ);
            camera.lookAt(0, 0, 0);
            controls.update();

            setLoading(false);
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
          },
          (error) => {
            console.error('Error loading STL:', error);
            setError('Failed to load STL file');
            setLoading(false);
          }
        );

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
          if (!viewerRef.current) return;
          camera.aspect = viewerRef.current.clientWidth / viewerRef.current.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          if (viewerRef.current?.contains(renderer.domElement)) {
            viewerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
          scene.clear();
        };

      } catch (err) {
        console.error('Error setting up STL viewer:', err);
        setError('Failed to initialize 3D viewer');
        setLoading(false);
      }
    };

    loadSTLViewer();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-red-300">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading model</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef} 
      className="h-64 w-full rounded-lg overflow-hidden border"
      style={{ minHeight: '300px' }}
    />
  );
};

export default STLViewer;
