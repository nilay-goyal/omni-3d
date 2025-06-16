import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface STLViewerState {
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  currentMesh: THREE.Mesh | null;
  wireframeMode: boolean;
  colorIndex: number;
}

const colors = [0x339900, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7];

// Type-safe material access
const isMeshPhongMaterial = (material: THREE.Material | THREE.Material[]): material is THREE.MeshPhongMaterial => {
  return !Array.isArray(material) && material.type === 'MeshPhongMaterial';
};

export const useSTLViewer = () => {
  const [state, setState] = useState<STLViewerState>({
    scene: null,
    camera: null,
    renderer: null,
    currentMesh: null,
    wireframeMode: false,
    colorIndex: 0,
  });
  
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    vertices: number;
  } | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null);

  const initScene = useCallback((container: HTMLDivElement) => {
    const width = container.clientWidth || 800;
    const height = 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(100, 100, 100);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-100, -100, -100);
    scene.add(directionalLight2);

    // Controls
    setupControls(renderer, camera, scene);

    setState(prev => ({
      ...prev,
      scene,
      camera,
      renderer
    }));

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return { scene, camera, renderer };
  }, []);

  const setupControls = (renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, scene: THREE.Scene) => {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;

    renderer.domElement.addEventListener('mousedown', (e) => {
      isMouseDown = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    renderer.domElement.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      if (state.currentMesh) {
        state.currentMesh.rotation.y += deltaX * 0.01;
        state.currentMesh.rotation.x += deltaY * 0.01;
      }

      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      const scale = e.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(scale);
    });
  };

  const loadBinarySTL = (buffer: ArrayBuffer): THREE.BufferGeometry => {
    console.log('Attempting to load as binary STL');
    const view = new DataView(buffer);
    
    if (buffer.byteLength < 84) {
      throw new Error('File too small to be a valid binary STL');
    }
    
    const triangles = view.getUint32(80, true);
    console.log('Binary STL triangles:', triangles);
    
    if (triangles === 0) {
      throw new Error('No triangles found in binary STL');
    }
    
    const expectedSize = 84 + triangles * 50;
    if (buffer.byteLength < expectedSize) {
      throw new Error('File size doesn\'t match expected binary STL format');
    }
    
    const geometry = new THREE.BufferGeometry();
    
    const vertices = [];
    const normals = [];
    let offset = 84;

    for (let i = 0; i < triangles; i++) {
      const nx = view.getFloat32(offset, true);
      const ny = view.getFloat32(offset + 4, true);
      const nz = view.getFloat32(offset + 8, true);

      for (let j = 0; j < 3; j++) {
        vertices.push(
          view.getFloat32(offset + 12 + j * 12, true),
          view.getFloat32(offset + 16 + j * 12, true),
          view.getFloat32(offset + 20 + j * 12, true)
        );
        normals.push(nx, ny, nz);
      }

      offset += 50;
    }

    console.log('Binary STL parsed, vertices:', vertices.length / 3);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geometry;
  };

  const loadTextSTL = (buffer: ArrayBuffer): THREE.BufferGeometry => {
    console.log('Attempting to load as text STL');
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n');

    console.log('First few lines:', lines.slice(0, 5));

    // Check if it's actually a text STL
    if (!text.toLowerCase().includes('solid')) {
      throw new Error('Not a valid text STL file');
    }

    const vertices = [];
    const normals = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('facet normal')) {
        const normalMatch = line.match(/facet normal\s+([\-\d\.e]+)\s+([\-\d\.e]+)\s+([\-\d\.e]+)/);
        if (normalMatch) {
          const nx = parseFloat(normalMatch[1]);
          const ny = parseFloat(normalMatch[2]);
          const nz = parseFloat(normalMatch[3]);

          for (let j = 0; j < 3; j++) {
            i++;
            if (i >= lines.length) break;
            const vertexLine = lines[i].trim();
            const vertexMatch = vertexLine.match(/vertex\s+([\-\d\.e]+)\s+([\-\d\.e]+)\s+([\-\d\.e]+)/);
            if (vertexMatch) {
              vertices.push(
                parseFloat(vertexMatch[1]),
                parseFloat(vertexMatch[2]),
                parseFloat(vertexMatch[3])
              );
              normals.push(nx, ny, nz);
            }
          }
        }
      }
    }

    console.log('Text STL parsed, vertices found:', vertices.length / 3);

    if (vertices.length === 0) {
      throw new Error('No vertices found in text STL');
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    return geometry;
  };

  const loadSTL = (buffer: ArrayBuffer): THREE.BufferGeometry => {
    try {
      return loadTextSTL(buffer);
    } catch (ex) {
      console.log('Loading as binary STL');
      return loadBinarySTL(buffer);
    }
  };

  const loadFile = useCallback((file: File) => {
    console.log('Loading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    if (!file.name.toLowerCase().endsWith('.stl')) {
      console.error('Please select an STL file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File read successfully, buffer size:', (e.target?.result as ArrayBuffer).byteLength);
      try {
        const geometry = loadSTL(e.target?.result as ArrayBuffer);
        console.log('Geometry created, vertices:', geometry.attributes.position.count);

        if (state.currentMesh && state.scene) {
          state.scene.remove(state.currentMesh);
        }

        const material = new THREE.MeshPhongMaterial({
          color: colors[state.colorIndex],
          shininess: 100
        });

        const mesh = new THREE.Mesh(geometry, material);
        console.log('Mesh created');

        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        console.log('Bounding box:', box);

        if (box && box.min && box.max) {
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);

          if (maxDim > 0) {
            const scale = 50 / maxDim;
            mesh.position.copy(center).multiplyScalar(-scale);
            mesh.scale.setScalar(scale);
            console.log('Model scaled and positioned');
          } else {
            console.warn('Invalid model dimensions, using default positioning');
            mesh.position.set(0, 0, 0);
          }
        } else {
          console.warn('Could not compute bounding box, using default positioning');
          mesh.position.set(0, 0, 0);
        }

        if (state.scene) {
          state.scene.add(mesh);
          console.log('Mesh added to scene');
        }

        setState(prev => ({ ...prev, currentMesh: mesh }));

        setFileInfo({
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          vertices: geometry.attributes.position.count
        });

        // Reset camera to look at the model
        resetCamera();

      } catch (error) {
        console.error('Error loading STL file:', error);
      }
    };

    reader.onerror = (e) => {
      console.error('File reading error:', e);
    };

    reader.readAsArrayBuffer(file);
  }, [state.scene, state.currentMesh, state.colorIndex]);

  const resetCamera = useCallback(() => {
    if (state.camera) {
      state.camera.position.set(50, 50, 50);
      state.camera.lookAt(0, 0, 0);
    }
  }, [state.camera]);

  const toggleWireframe = useCallback(() => {
    if (state.currentMesh && isMeshPhongMaterial(state.currentMesh.material)) {
      const newWireframeMode = !state.wireframeMode;
      state.currentMesh.material.wireframe = newWireframeMode;
      setState(prev => ({ ...prev, wireframeMode: newWireframeMode }));
    }
  }, [state.currentMesh, state.wireframeMode]);

  const changeColor = useCallback(() => {
    if (state.currentMesh && isMeshPhongMaterial(state.currentMesh.material)) {
      const newColorIndex = (state.colorIndex + 1) % colors.length;
      state.currentMesh.material.color.setHex(colors[newColorIndex]);
      setState(prev => ({ ...prev, colorIndex: newColorIndex }));
    }
  }, [state.currentMesh, state.colorIndex]);

  return {
    initScene,
    loadFile,
    resetCamera,
    toggleWireframe,
    changeColor,
    fileInfo,
    viewerRef,
    wireframeMode: state.wireframeMode
  };
};
