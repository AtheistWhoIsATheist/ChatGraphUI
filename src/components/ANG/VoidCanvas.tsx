import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const VoidCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Core Initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Hyper-geometry Construct (Void Projection)
    const geometry = new THREE.IcosahedronGeometry(12, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x8B5CF6, // violet-ethereal
      transparent: true, 
      opacity: 0.15
    });
    
    const mesh = new THREE.LineSegments(edges, material);
    scene.add(mesh);

    // Inner Core (Cyan Cosmic Singularity)
    const coreGeo = new THREE.OctahedronGeometry(4, 0);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({
      color: 0x00F0FF, // cyan-cosmic
      transparent: true,
      opacity: 0.3
    });
    const coreMesh = new THREE.LineSegments(coreEdges, coreMat);
    scene.add(coreMesh);

    camera.position.z = 25;

    // Temporal Distortion (Animation Loop)
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      mesh.rotation.x += 0.001;
      mesh.rotation.y += 0.002;
      
      coreMesh.rotation.x -= 0.003;
      coreMesh.rotation.z -= 0.002;

      renderer.render(scene, camera);
    };
    animate();

    // Spatial Resurgence (Resize handler)
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Annihilation (Cleanup)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      edges.dispose();
      material.dispose();
      coreGeo.dispose();
      coreEdges.dispose();
      coreMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen" />;
};
