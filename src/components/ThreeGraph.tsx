import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Node, Link } from '../data/corpus';

export function ThreeGraph({ nodes, links, onNodeSelect }: { nodes: Node[], links: Link[], onNodeSelect?: (n: Node) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup based on Nihiltheismo void rendering principles
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(70, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 2000);
    camera.position.set(0, 2, 30);
    camera.lookAt(0, 0, 0);

    // Renderer setup for ACES Filmic mapping and SRGB
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.enablePan = true;
    controls.panSpeed = 0.5;

    // Void Light setup
    const ambientLight = new THREE.AmbientLight(0x0a0a12, 0.4);
    scene.add(ambientLight);
    
    // Add point light to camera
    const pointLight = new THREE.PointLight(0x00e5ff, 0.6, 80);
    camera.add(pointLight);
    scene.add(camera);

    // Generate Nodes with Specific Geometries
    const getVoidColor = (type: string): THREE.Color => {
      switch (type) {
        case 'thinker': return new THREE.Color(0xbd00ff); // Mystic Purple
        case 'concept': return new THREE.Color(0x00e5ff); // Cyber Cyan
        case 'praxis': return new THREE.Color(0xff9500); // Dread Amber
        default: return new THREE.Color(0xe0e0e0); // Bone White
      }
    };

    const geometries = {
      thinker: new THREE.IcosahedronGeometry(1.5, 1),
      concept: new THREE.OctahedronGeometry(1.2, 0),
      praxis: new THREE.TetrahedronGeometry(1.2, 0)
    };

    const nodeMap = new Map<string, THREE.Mesh>();
    const nodeOriginalPositions = new Map<string, THREE.Vector3>();

    nodes.forEach(n => {
      // Use fallback geometry if type is not recognized
      const geometryToUse = geometries[n.type as keyof typeof geometries] || geometries.concept;
      const meshColor = getVoidColor(n.type);
      
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: meshColor,
        emissive: meshColor,
        emissiveIntensity: 0.4,
        metalness: 0.3,
        roughness: 0.4
      });

      const mesh = new THREE.Mesh(geometryToUse, nodeMaterial);

      const r = 40 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      
      // No need to reset colors manually since we did it on creation
      mesh.userData = { id: n.id, data: n };
      scene.add(mesh);
      nodeMap.set(n.id, mesh);
      nodeOriginalPositions.set(n.id, mesh.position.clone());
    });

    // Generate Links (Lines)
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00e5ff, 
      transparent: true, 
      opacity: 0.15,
      blending: THREE.AdditiveBlending 
    });
    
    links.forEach(l => {
        const sid = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const tid = typeof l.target === 'string' ? l.target : (l.target as any).id;
        
        const smesh = nodeMap.get(sid);
        const tmesh = nodeMap.get(tid);
        
        if (smesh && tmesh) {
            // For a better visual, we would use TubeGeometry along a QuadraticBezierCurve3
            // Here we use simple lines for performance and baseline representation
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

    const breathPhase = (time: number): number => {
      return 0.85 + Math.sin(time * 0.5 * Math.PI) * 0.15; // 0.70–1.00 range
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle floating animation and breathing
      const phase = breathPhase(time);
      nodeMap.forEach((mesh, id) => {
        const orig = nodeOriginalPositions.get(id)!;
        mesh.position.y = orig.y + Math.sin(time + orig.x) * 2;
        mesh.rotation.x += delta;
        mesh.rotation.y += delta;
        
        // Apply breathing effect to emissive intensity
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
           const baseIntensity = 0.4;
           mesh.material.emissiveIntensity = baseIntensity * phase;
        }
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
      Object.values(geometries).forEach(g => g.dispose());
      nodeMap.forEach(mesh => {
          if(Array.isArray(mesh.material)) {
             mesh.material.forEach(m => m.dispose());
          } else {
             mesh.material.dispose();
          }
      });
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
    </div>
  );
}
