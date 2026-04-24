import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Node, Link } from '../data/corpus';

export function ThreeGraph({ nodes, links, onNodeSelect }: { nodes: Node[], links: Link[], onNodeSelect?: (n: Node) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 50, 50);
    scene.add(dirLight);

    // Generate Nodes
    const nodeGeometry = new THREE.SphereGeometry(1, 16, 16);
    const nodeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf97316, 
      emissive: 0xf97316,
      emissiveIntensity: 0.5
    });
    
    // We'll use InstancedMesh for performance if large, but there are different colors.
    // For simplicity, regular meshes:
    const nodeMap = new Map<string, THREE.Mesh>();
    const nodeOriginalPositions = new Map<string, THREE.Vector3>();
    
    // Naive 3D layout (random sphere)
    nodes.forEach(n => {
      const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
      const r = 40 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      
      // Try to differentiate colors
      let colorHex = 0x71717a;
      if (n.type === 'concept') colorHex = 0xef4444;
      if (n.type === 'thinker') colorHex = 0x3b82f6;
      if (n.type === 'praxis') colorHex = 0x84cc16;
      
      (mesh.material as THREE.MeshStandardMaterial).color.setHex(colorHex);
      (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(colorHex);
      
      mesh.userData = { id: n.id, data: n };
      scene.add(mesh);
      nodeMap.set(n.id, mesh);
      nodeOriginalPositions.set(n.id, mesh.position.clone());
    });

    // Generate Links (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    
    links.forEach(l => {
        const sid = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const tid = typeof l.target === 'string' ? l.target : (l.target as any).id;
        
        const smesh = nodeMap.get(sid);
        const tmesh = nodeMap.get(tid);
        
        if (smesh && tmesh) {
            const geom = new THREE.BufferGeometry().setFromPoints([smesh.position, tmesh.position]);
            const line = new THREE.Line(geom, lineMaterial);
            scene.add(line);
        }
    });

    // Interaction Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(nodeMap.values()));
        
        if (intersects.length > 0) {
            if (onNodeSelect && intersects[0].object.userData.data) {
                onNodeSelect(intersects[0].object.userData.data);
            }
        }
    };
    
    renderer.domElement.addEventListener('click', onClick);

    // Animation Loop
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle floating animation
      nodeMap.forEach((mesh, id) => {
        const orig = nodeOriginalPositions.get(id)!;
        mesh.position.y = orig.y + Math.sin(time + orig.x) * 2;
        mesh.rotation.x += delta;
        mesh.rotation.y += delta;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onClick);
      
      // Cleanup Three.js
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      
      if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, links, onNodeSelect]);

  return (
    <div className="w-full h-full relative bg-black">
      <div 
        ref={mountRef} 
        className="absolute inset-0 outline-none" 
        style={{ cursor: 'crosshair' }} 
      />
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h2 className="text-xl font-light text-white tracking-widest uppercase">3D Topological View</h2>
        <p className="text-xs text-zinc-500 uppercase">Powered by Three.js</p>
      </div>
    </div>
  );
}
