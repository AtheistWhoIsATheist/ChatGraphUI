import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SimulatedNode, SimulatedLink } from '../hooks/useSimulation';

interface NetworkGraph3DProps {
  nodes: SimulatedNode[];
  links: SimulatedLink[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  width: number;
  height: number;
}

const COLOR_MAPPINGS: Record<string, number> = {
  'Ontological Core': 0xffffff,
  'Conceptual Core': 0xa1a1aa,
  'Epistemological': 0x0ea5e9,
  'Theological': 0xf59e0b,
  'Phenomenological': 0xf43f5e,
  'Existential': 0x8b5cf6,
  'Praxis': 0x10b981
};

export const NetworkGraph3DComponent: React.FC<NetworkGraph3DProps> = ({
  nodes,
  links,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  width,
  height
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Keep stable references to three.js objects for fast updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodeMeshesRef = useRef<Record<string, THREE.Mesh>>({});
  const linkLinesRef = useRef<THREE.LineSegments | null>(null);
  const hoverRingRef = useRef<THREE.Mesh | null>(null);
  
  // Custom rotation params
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.2, y: -0.4 });
  const zoomRef = useRef(1.0);

  // Set up threejs scene
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
    camera.position.set(0, 0, 750);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 1000);
    pointLight1.position.set(200, 300, 400);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 1000);
    pointLight2.position.set(-200, -300, -400);
    scene.add(pointLight2);

    // 5. Ambient starfield particle background
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1500;
      starPositions[i + 1] = (Math.random() - 0.5) * 1500;
      starPositions[i + 2] = (Math.random() - 0.5) * 1500;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x2e2e2e,
      size: 1.8,
      sizeAttenuation: true
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 6. Selected node highlight ring
    const ringGeo = new THREE.RingGeometry(24, 26, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const hoverRing = new THREE.Mesh(ringGeo, ringMat);
    hoverRing.visible = false;
    scene.add(hoverRing);
    hoverRingRef.current = hoverRing;

    // 7. Render loops
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation in 3D space when user is not actively dragging
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.0012;
      }

      // Smooth camera orbit mapping
      if (cameraRef.current && sceneRef.current) {
        const radius = 650 * zoomRef.current;
        cameraRef.current.position.x = radius * Math.sin(rotationRef.current.y) * Math.cos(rotationRef.current.x);
        cameraRef.current.position.y = radius * Math.sin(rotationRef.current.x);
        cameraRef.current.position.z = radius * Math.cos(rotationRef.current.y) * Math.cos(rotationRef.current.x);
        cameraRef.current.lookAt(new THREE.Vector3(0, 0, 0));
        
        // Orient highlight ring to face the camera
        if (hoverRingRef.current) {
          hoverRingRef.current.quaternion.copy(cameraRef.current.quaternion);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    };
  }, []);

  // Update sizes on dimensions change
  useEffect(() => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
  }, [width, height]);

  // Construct and update meshes dynamically from simulated node state stream
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Scale 2D coords to a neat centered 3D frame:
    // Simulated width: height ranges from 0-width, 0-height. Move origin to center.
    const mapCoords = (x: number, y: number, res: number) => {
      const scaleX = (x - width / 2) * 1.0;
      const scaleY = -(y - height / 2) * 1.0;
      // Era/Resonating based wave displacement for elegant depth feel
      const scaleZ = Math.sin(res * 0.08) * 110;
      return new THREE.Vector3(scaleX, scaleY, scaleZ);
    };

    // 1. Update/Create nodes meshes
    nodes.forEach(node => {
      const pos = mapCoords(node.x, node.y, node.resonance);
      let mesh = nodeMeshesRef.current[node.id];

      if (!mesh) {
        // Create new sphere mesh for this node
        const size = node.id === 'void' ? 14 : 10;
        const geo = new THREE.SphereGeometry(size, 24, 24);
        const col = COLOR_MAPPINGS[node.type] || 0xdddddd;
        
        const mat = new THREE.MeshPhongMaterial({
          color: col,
          emissive: col,
          emissiveIntensity: 0.15,
          shininess: 90,
          transparent: true,
          opacity: 0.95
        });

        mesh = new THREE.Mesh(geo, mat);
        // Link node data securely inside mesh object for raycast identification
        mesh.userData = { nodeId: node.id };
        
        scene.add(mesh);
        nodeMeshesRef.current[node.id] = mesh;
      }

      // Smoothly update spatial position
      mesh.position.copy(pos);

      // Handle active state highlights on node meshes
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const mat = mesh.material as THREE.MeshPhongMaterial;

      if (isSelected) {
        mat.emissiveIntensity = 0.85;
        mat.opacity = 1.0;
        
        // Position hover highlight ring around selected node
        if (hoverRingRef.current) {
          hoverRingRef.current.position.copy(pos);
          hoverRingRef.current.visible = true;
          // Scale based on selected node size
          const scale = node.id === 'void' ? 1.0 : 0.8;
          hoverRingRef.current.scale.set(scale, scale, scale);
        }
      } else if (isHovered) {
        mat.emissiveIntensity = 0.55;
        mat.opacity = 1.0;
      } else {
        mat.emissiveIntensity = 0.15;
        mat.opacity = 0.8;
      }
    });

    if (!selectedNodeId && hoverRingRef.current) {
      hoverRingRef.current.visible = false;
    }

    // Clean up outdated meshes (if any)
    Object.keys(nodeMeshesRef.current).forEach(id => {
      if (!nodes.find(n => n.id === id)) {
        scene.remove(nodeMeshesRef.current[id]);
        nodeMeshesRef.current[id].geometry.dispose();
        (nodeMeshesRef.current[id].material as THREE.Material).dispose();
        delete nodeMeshesRef.current[id];
      }
    });

    // 2. Build or rebuild links structure inside 3D environment
    if (linkLinesRef.current) {
      scene.remove(linkLinesRef.current);
      linkLinesRef.current.geometry.dispose();
      (linkLinesRef.current.material as THREE.Material).dispose();
      linkLinesRef.current = null;
    }

    const linePoints: THREE.Vector3[] = [];
    const lineColors: THREE.Color[] = [];

    links.forEach(link => {
      const sNode = typeof link.source === 'object' ? link.source : null;
      const tNode = typeof link.target === 'object' ? link.target : null;

      if (sNode && tNode) {
        const pStart = mapCoords(sNode.x, sNode.y, sNode.resonance);
        const pEnd = mapCoords(tNode.x, tNode.y, tNode.resonance);

        linePoints.push(pStart, pEnd);

        // Compute highlighting colors
        const activeId = selectedNodeId || hoveredNodeId;
        const isHighlighted = activeId && (sNode.id === activeId || tNode.id === activeId);

        const col = isHighlighted ? new THREE.Color(0xffffff) : new THREE.Color(0x222222);
        lineColors.push(col, col);
      }
    });

    if (linePoints.length > 0) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      
      const colorsFloat32 = new Float32Array(lineColors.length * 3);
      lineColors.forEach((col, idx) => {
        colorsFloat32[idx * 3] = col.r;
        colorsFloat32[idx * 3 + 1] = col.g;
        colorsFloat32[idx * 3 + 2] = col.b;
      });
      lineGeo.setAttribute('color', new THREE.BufferAttribute(colorsFloat32, 3));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        linewidth: 1
      });

      const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lineSegments);
      linkLinesRef.current = lineSegments;
    }

  }, [nodes, links, selectedNodeId, hoveredNodeId]);

  // Raycasting helper to pick/hover nodes
  const performRaycasting = (clientX: number, clientY: number, action: 'hover' | 'click') => {
    if (!containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes = Object.values(nodeMeshesRef.current);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const firstIntersect = intersects[0];
      const nodeId = firstIntersect.object.userData?.nodeId;
      if (nodeId) {
        if (action === 'click') {
          onSelectNode(nodeId === selectedNodeId ? null : nodeId);
        } else {
          onHoverNode(nodeId);
        }
        return;
      }
    }

    if (action === 'click') {
      onSelectNode(null);
    } else {
      onHoverNode(null);
    }
  };

  // Drag orbit handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      // Orbit rotations mapping
      rotationRef.current.y += deltaX * 0.007;
      rotationRef.current.x = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, rotationRef.current.x + deltaY * 0.007));

      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    } else {
      // Raycast on hover
      performRaycasting(e.clientX, e.clientY, 'hover');
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    } else {
      // Raycast on click
      performRaycasting(e.clientX, e.clientY, 'click');
    }
  };

  // Handlers for wheel zoom controls
  const handleWheel = (e: React.WheelEvent) => {
    zoomRef.current = Math.max(0.4, Math.min(2.5, zoomRef.current + e.deltaY * 0.001));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden z-0 select-none bg-black"
      style={{ touchAction: 'none' }}
    />
  );
};

export const NetworkGraph3D = React.memo(NetworkGraph3DComponent);
