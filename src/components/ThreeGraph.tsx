import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Node, Link } from '../data/corpus';

// Fallback void quotient generator if missing in data
function getVoidQuotient(node: Node) {
  if ((node as any).properties?.void_quotient !== undefined) return (node as any).properties.void_quotient;
  const chars = node.id.split('').map((c: string) => c.charCodeAt(0)).reduce((a: number, b: number) => a + b, 0);
  return (chars % 100) / 100;
}

const voidColor = (vq: number): THREE.Color => {
  if (vq >= 0.75) return new THREE.Color(0xe4e4e7); // zinc-200
  if (vq >= 0.50) return new THREE.Color(0xa1a1aa); // zinc-400
  if (vq >= 0.25) return new THREE.Color(0x71717a); // zinc-500
  return new THREE.Color(0x52525b);                 // zinc-600
};

const baseScale = (nodeType: string, count: number, vq: number): number => {
  const type = nodeType.toUpperCase();
  if (type === 'THINKER') return 0.5 + Math.log2(count + 1) * 0.3;
  if (type === 'QUOTE' || type === 'DATA') return 0.15 + vq * 0.25;
  if (type === 'THEME' || type === 'CONCEPT') return 0.3 + Math.log2(count + 1) * 0.15;
  if (type === 'CLAIM' || type === 'PRAXIS') return 0.2;
  return 0.4; // PARADOX or default
};

export function ThreeGraph({ nodes, links, onNodeSelect }: { nodes: Node[], links: Link[], onNodeSelect?: (n: Node) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090b);
    scene.fog = new THREE.FogExp2(0x09090b, 0.018); // BUG-FIX: Adjusted fog density

    const camera = new THREE.PerspectiveCamera(70, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 2000);
    camera.position.set(0, 8, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x09090b); // BUG-FIX: Explicit clear color
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 3; // Modified to allow closer inspection
    controls.maxDistance = 200;
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x18181b, 1.2);
    scene.add(ambientLight);
    
    // BUG-FIX: Add point light correctly to scene and camera for depth
    const pointLight = new THREE.PointLight(0xffffff, 0.4, 80, 1.5);
    camera.add(pointLight);
    scene.add(camera);

    const nodeMap = new Map<string, THREE.Mesh>();
    const originalEmissives = new Map<string, number>();
    const edgeMaterials: THREE.Material[] = [];

    // Layout
    nodes.forEach(n => {
       const upperType = n.type.toUpperCase();
       let geom: THREE.BufferGeometry;
       const vq = getVoidQuotient(n);
       const quotesCount = (n as any).properties?.quote_count || 5;
       const radius = baseScale(n.type, quotesCount, vq);

       if (upperType === 'THINKER') geom = new THREE.IcosahedronGeometry(radius, 1);
       else if (upperType === 'QUOTE' || upperType === 'DATA') geom = new THREE.OctahedronGeometry(radius, 0);
       else if (upperType === 'THEME' || upperType === 'CONCEPT') geom = new THREE.TorusGeometry(radius, radius*0.08, 8, 32);
       else if (upperType === 'CLAIM' || upperType === 'PRAXIS') geom = new THREE.TetrahedronGeometry(radius, 0);
       else geom = new THREE.DodecahedronGeometry(radius, 0);

       const c = voidColor(vq);
       
       // BUG-FIX: Clone colors explicitly for material emission
       const mat = new THREE.MeshStandardMaterial({
         color: c.clone(),
         emissive: c.clone(), 
         emissiveIntensity: 0.15 + vq * 0.3,
         metalness: 0.3,
         roughness: 0.4
       });

       const mesh = new THREE.Mesh(geom, mat);
       
       // Handle positions - fallback to random sphere if position missing
       if ((n as any).position) {
          mesh.position.set((n as any).position.x, (n as any).position.y, (n as any).position.z);
       } else {
          // Fallback to avoid origin clustering (BUG-FIX)
          const r = 20 * Math.cbrt(Math.random()) + 5;
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          mesh.position.set(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          );
       }
       mesh.renderOrder = 2; // Keep rendering order consistent

       mesh.userData = { id: n.id, data: n, type: upperType };
       scene.add(mesh);
       nodeMap.set(n.id, mesh);
       originalEmissives.set(n.id, mat.emissiveIntensity);
    });

    links.forEach(l => {
        const sid = typeof l.source === 'string' ? l.source : (l.source as any).id;
        const tid = typeof l.target === 'string' ? l.target : (l.target as any).id;
        
        const smesh = nodeMap.get(sid);
        const tmesh = nodeMap.get(tid);
        const type = (l.type && typeof l.type === 'string') ? l.type.toUpperCase() : '';
        
        if (smesh && tmesh) {
            const start = smesh.position.clone();
            const end = tmesh.position.clone();
            const score = (l as any).properties?.score ?? 0.5;

            // BUG-FIX: Edge glow unique materials
            if (type === 'RESONANCE' || type === 'CULMINATES') {
               const mid = start.clone().lerp(end, 0.5);
               const curve = new THREE.QuadraticBezierCurve3(
                 start,
                 mid.add(new THREE.Vector3(0, score * 3, 0)),
                 end
               );
               const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.01 + score * 0.015, 6, false);
               const tubeMat = new THREE.MeshBasicMaterial({
                 color: 0x71717a,
                 transparent: true,
                 opacity: typeof score === 'number' && !isNaN(score) ? score * 0.4 : 0.2,
                 blending: THREE.AdditiveBlending,
                 depthWrite: false,
               });
               const line = new THREE.Mesh(tubeGeo, tubeMat);
               line.renderOrder = 1;
               scene.add(line);
               edgeMaterials.push(tubeMat);
            } else if (type === 'TENSION' || type === 'PARADOX' || type === 'OBJECTION') {
               const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
               const mat = new THREE.LineDashedMaterial({
                 color: 0x52525b,
                 transparent: true,
                 opacity: typeof score === 'number' && !isNaN(score) ? 0.2 + score * 0.15 : 0.3,
                 dashSize: 0.5,
                 gapSize: 0.25,
               });
               const line = new THREE.LineSegments(geo, mat);
               line.computeLineDistances();
               line.renderOrder = 1;
               scene.add(line);
               edgeMaterials.push(mat);
            } else {
               const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
               const mat = new THREE.LineBasicMaterial({
                 color: 0x27272a,
                 transparent: true,
                 opacity: 0.2,
               });
               const line = new THREE.LineSegments(geo, mat);
               line.renderOrder = 1;
               scene.add(line);
               edgeMaterials.push(mat);
            }
        }
    });

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.3; // BUG-FIX: Hitting small elements
    const mouse = new THREE.Vector2();
    
    let hoverMesh: THREE.Mesh | null = null;
    let originalHoverScale = new THREE.Vector3(1,1,1);
    
    // Label Container
    const labelContainer = document.createElement('div');
    labelContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10;';
    mountRef.current.appendChild(labelContainer);
    
    const nodeLabels = new Map<string, HTMLDivElement>();
    
    nodeMap.forEach((mesh, id) => {
        const p = mesh.userData.data;
        const labelText = p.label || id;
        const label = document.createElement('div');
        label.textContent = labelText.length > 28 ? labelText.slice(0, 28) + '…' : labelText;
        const colorHex = (mesh.material as THREE.MeshStandardMaterial).color.getHexString();
        label.style.cssText = `
          position: absolute;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 10px;
          color: #${colorHex};
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
          white-space: nowrap;
          text-shadow: 0 0 8px rgba(0,0,0,0.9);
          letter-spacing: 0.05em;
          padding: 2px 4px;
          background: rgba(5,5,5,0.7);
          border-radius: 2px;
          transform: translateX(-50%);
        `;
        labelContainer.appendChild(label);
        nodeLabels.set(id, label);
    });

    const LABEL_THRESHOLDS: Record<string, number> = { THINKER: 28, THEME: 22, QUOTE: 12, CLAIM: 18, CONCEPT: 22, DATA: 12, PRAXIS: 18 };

    const updateLabels = () => {
      if (!mountRef.current) return;
      const camPos = camera.position;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      nodeLabels.forEach((label, nodeId) => {
        const mesh = nodeMap.get(nodeId);
        if (!mesh) return;
        const dist = mesh.position.distanceTo(camPos);
        const threshold = LABEL_THRESHOLDS[mesh.userData.type] || 20;
        if (dist < threshold) {
          const pos = mesh.position.clone().project(camera);
          
          if (pos.z > 1) { // Behind camera
             label.style.opacity = '0';
             return;
          }
          
          const x = (pos.x * 0.5 + 0.5) * width;
          const y = (-pos.y * 0.5 + 0.5) * height;
          label.style.left = `${x}px`;
          label.style.top = `${y - 16}px`;
          label.style.opacity = String(Math.max(0, 1 - (dist / threshold) * 0.5));
        } else {
          label.style.opacity = '0';
        }
      });
    };

    const onMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(nodeMap.values()), false);

        if (intersects.length > 0) {
          const obj = intersects[0].object as THREE.Mesh;
          if (hoverMesh !== obj) {
            if (hoverMesh) {
               hoverMesh.scale.copy(originalHoverScale);
               (hoverMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = originalEmissives.get(hoverMesh.userData.id) || 0.4;
            }
            hoverMesh = obj;
            originalHoverScale.copy(hoverMesh.scale);
            hoverMesh.scale.multiplyScalar(1.15); // Adjust scale pulse
            (hoverMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = (originalEmissives.get(hoverMesh.userData.id) || 0.4) + 0.25;
            
            document.body.style.cursor = 'pointer';
            setHoveredNode(obj.userData.data);
          }
        } else {
          if (hoverMesh) {
             hoverMesh.scale.copy(originalHoverScale);
             (hoverMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = originalEmissives.get(hoverMesh.userData.id) || 0.4;
             hoverMesh = null;
             document.body.style.cursor = 'crosshair';
             setHoveredNode(null);
          }
        }
    };

    const onClick = (event: MouseEvent) => {
        if (hoverMesh) {
            if (onNodeSelect && hoverMesh.userData.data) {
                onNodeSelect(hoverMesh.userData.data);
            }
        }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const phase = 0.85 + Math.sin(time * 0.5 * Math.PI) * 0.15; 

      nodeMap.forEach((mesh, id) => {
         if (mesh !== hoverMesh) { 
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = (originalEmissives.get(id) || 0.4) * phase;
         }
         
         // BUG-FIX: CLAIM node oscillation
         if (mesh.userData.type === 'CLAIM') {
            const claimPulse = Math.sin(time * 0.3 * Math.PI) * 0.15 + 0.35;
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = claimPulse;
         }

         mesh.rotation.y += 0.005;
         mesh.rotation.z += 0.002;
      });

      updateLabels(); // BUG-FIX: Proximity labels

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // BUG-FIX: Debounce window resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 200);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      
      // BUG-FIX: dispose controls
      controls.dispose();

      nodeMap.forEach(mesh => {
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose());
          else (mesh.material as THREE.Material).dispose();
      });
      
      edgeMaterials.forEach(m => m.dispose());
      
      renderer.dispose();
      if (labelContainer.parentNode) {
          labelContainer.parentNode.removeChild(labelContainer);
      }
      if (mountRef.current?.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [nodes, links, onNodeSelect]);

  return (
    <div className="w-full h-full relative  border-l-[#333] bg-zinc-900/50">
      <div ref={mountRef} className="absolute inset-0 outline-none" style={{ cursor: 'crosshair' }} />
      {hoveredNode && (
         <div className="absolute top-8 left-8 z-20 bg-zinc-950 border border-white/10 p-6 min-w-[250px] max-w-sm pointer-events-none transition-opacity shadow-2xl rounded-xl backdrop-blur-md transition-all">
            <div className="text-[10px]  font-bold tracking-widest text-zinc-300 mb-2 bg-white/10 inline-block px-2 py-1 border border-white/10">{hoveredNode.type}</div>
            <div className="font-mono font-bold text-lg leading-snug break-words mb-4 text-white">{hoveredNode.label}</div>
            
            <div className="flex flex-col gap-2 mt-4 border-t border-white/5 pt-4">
               {/* Global attributes */}
               {getVoidQuotient(hoveredNode) !== undefined && (
                 <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
                   <span className="text-zinc-400  tracking-widest text-[10px] font-bold">Analysis Quotient</span>
                   <span className="text-zinc-200 text-sm">{getVoidQuotient(hoveredNode).toFixed(3)}</span>
                 </div>
               )}
               
               {/* Type-specific attributes */}
               {hoveredNode.type.toUpperCase() === 'THINKER' && (hoveredNode as any).properties && (
                 <>
                   {((hoveredNode as any).properties.era) && (
                     <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
                       <span className="text-zinc-400  tracking-widest text-[10px] font-bold">Era</span>
                       <span className="text-zinc-300 text-sm text-right">{(hoveredNode as any).properties.era}</span>
                     </div>
                   )}
                   {((hoveredNode as any).properties.quote_count) !== undefined && (
                     <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
                       <span className="text-zinc-400  tracking-widest text-[10px] font-bold">Quotes</span>
                       <span className="text-zinc-200 text-sm text-right">{(hoveredNode as any).properties.quote_count}</span>
                     </div>
                   )}
                 </>
               )}
               
               {hoveredNode.type.toUpperCase() === 'CLAIM' && (hoveredNode as any).properties && (
                 <>
                   {((hoveredNode as any).properties.confidence) !== undefined && (
                     <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
                       <span className="text-zinc-400  tracking-widest text-[10px] font-bold">Confidence</span>
                       <span className="text-zinc-300 font-bold text-sm text-right">{((hoveredNode as any).properties.confidence * 100).toFixed(0)}%</span>
                     </div>
                   )}
                   {((hoveredNode as any).properties.epistemic_status) && (
                     <div className="flex justify-between items-baseline gap-3 text-[11px] font-mono">
                       <span className="text-zinc-400  tracking-widest text-[10px] font-bold">Status</span>
                       <span className="text-zinc-300  tracking-wider text-[10px] text-right font-bold">{(hoveredNode as any).properties.epistemic_status}</span>
                     </div>
                   )}
                   {((hoveredNode as any).properties.content) && (
                     <div className="mt-4 text-xs font-mono text-zinc-300 leading-relaxed italic border-l-2 border-white/10 pl-3 py-2 bg-white/5">
                       "{(hoveredNode as any).properties.content.length > 150 ? (hoveredNode as any).properties.content.slice(0, 150) + '...' : (hoveredNode as any).properties.content}"
                     </div>
                   )}
                 </>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
