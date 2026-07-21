import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import './SignInBackground.css';

// Hook to detect reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
};

// Component for subtle parallax based on mouse movement
const MouseParallax = ({ children, isReducedMotion }) => {
  const groupRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      // Normalize mouse coordinates to -1 to +1
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    if (!isReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isReducedMotion]);

  useFrame((state, delta) => {
    if (groupRef.current && !isReducedMotion) {
      // Smoothly interpolate rotation based on mouse position
      const targetRotationX = mouse.current.y * 0.1;
      const targetRotationY = mouse.current.x * 0.1;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// Abstract 3D Shapes
const Shapes = ({ isReducedMotion }) => {
  // Shared materials for consistency
  const charcoalMaterial = new THREE.MeshStandardMaterial({ color: '#2A2A2A', roughness: 0.8 });
  const graphiteMaterial = new THREE.MeshStandardMaterial({ color: '#404040', roughness: 0.8 });
  const amberMaterial = new THREE.MeshStandardMaterial({ color: '#D96D55', roughness: 0.6 });

  // Floating configurations depending on motion preference
  const floatSpeed = isReducedMotion ? 0 : 1;
  const floatIntensity = isReducedMotion ? 0 : 1;
  const rotationIntensity = isReducedMotion ? 0 : 1;

  // Individual shape rotators for continuous spinning
  const AutoRotate = ({ children, speed = 1 }) => {
    const ref = useRef();
    useFrame((state, delta) => {
      if (ref.current && !isReducedMotion) {
        ref.current.rotation.x += delta * 0.2 * speed;
        ref.current.rotation.y += delta * 0.3 * speed;
      }
    });
    return <group ref={ref}>{children}</group>;
  };

  return (
    <>
      {/* Top Left Sphere */}
      <Float speed={floatSpeed * 1.5} rotationIntensity={rotationIntensity * 0.5} floatIntensity={floatIntensity * 2}>
        <mesh position={[-4, 3, -5]} material={charcoalMaterial}>
          <sphereGeometry args={[1.2, 32, 32]} />
        </mesh>
      </Float>

      {/* Bottom Right Rounded Box / Cube (using basic box for performance, smooth via material/bevel if needed) */}
      <Float speed={floatSpeed * 1.2} rotationIntensity={rotationIntensity * 1.5} floatIntensity={floatIntensity * 1.5}>
        <AutoRotate speed={0.8}>
          <mesh position={[5, -3, -4]} material={graphiteMaterial}>
            <boxGeometry args={[2, 2, 2]} />
          </mesh>
        </AutoRotate>
      </Float>

      {/* Top Right Torus (Accent) */}
      <Float speed={floatSpeed * 2} rotationIntensity={rotationIntensity * 2} floatIntensity={floatIntensity * 1}>
        <AutoRotate speed={1.2}>
          <mesh position={[4.5, 3.5, -6]} material={amberMaterial}>
            <torusGeometry args={[1.5, 0.4, 16, 64]} />
          </mesh>
        </AutoRotate>
      </Float>

      {/* Bottom Left Small Sphere */}
      <Float speed={floatSpeed * 0.8} rotationIntensity={rotationIntensity * 0.2} floatIntensity={floatIntensity * 3}>
        <mesh position={[-5, -2.5, -3]} material={graphiteMaterial}>
          <sphereGeometry args={[0.8, 32, 32]} />
        </mesh>
      </Float>

      {/* Center Right Icosahedron/Dodecahedron-like (Accent) */}
      <Float speed={floatSpeed * 1.1} rotationIntensity={rotationIntensity * 1.2} floatIntensity={floatIntensity * 0.5}>
        <AutoRotate speed={0.5}>
          <mesh position={[3, 0, -8]} material={amberMaterial}>
            <icosahedronGeometry args={[1.5, 0]} />
          </mesh>
        </AutoRotate>
      </Float>

      {/* Far Left Background Torus */}
      <Float speed={floatSpeed * 0.5} rotationIntensity={rotationIntensity * 0.8} floatIntensity={floatIntensity * 1.2}>
        <AutoRotate speed={-0.6}>
          <mesh position={[-6, 1, -10]} material={charcoalMaterial}>
            <torusGeometry args={[2.5, 0.6, 16, 48]} />
          </mesh>
        </AutoRotate>
      </Float>
    </>
  );
};

const SignInBackground = () => {
  const isReducedMotion = usePrefersReducedMotion();

  return (
    <div className="signin-background-container">
      <Canvas 
        className="signin-background-canvas"
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]} // Cap pixel ratio for performance
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.2} color="#D96D55" />
        
        <MouseParallax isReducedMotion={isReducedMotion}>
          <Shapes isReducedMotion={isReducedMotion} />
        </MouseParallax>
      </Canvas>
    </div>
  );
};

export default SignInBackground;
