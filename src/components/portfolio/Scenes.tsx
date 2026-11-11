import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// Feel constants
const FOLLOW = 2.4; // how quickly the object follows the pointer
const TILT_Y = 0.38;
const TILT_X = 0.26;
const SPIN = 0.1;

/** Pointer tracked on the window so the scene reacts even when text sits above the canvas. */
function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return p;
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 14;
      a[i * 3 + 1] = (Math.random() - 0.5) * 9;
      a[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return a;
  }, [count]);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#bfdbfe" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Orbit({ reduced }: { reduced: boolean }) {
  const pointer = usePointer();
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const thin = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const g = group.current;
    if (g) {
      const k = 1 - Math.exp(-FOLLOW * d);
      g.rotation.y += (pointer.current.x * TILT_Y - g.rotation.y) * k;
      g.rotation.x += (-pointer.current.y * TILT_X - g.rotation.x) * k;
    }
    if (!reduced) {
      if (ring.current) ring.current.rotation.z += d * SPIN;
      if (thin.current) thin.current.rotation.z -= d * SPIN * 0.5;
    }
  });
  return (
    <group ref={group}>
      <Float speed={reduced ? 0 : 1} rotationIntensity={0.2} floatIntensity={0.45}>
        <group rotation={[1.18, -0.3, 0.18]}>
          <mesh ref={ring}>
            <torusGeometry args={[2.15, 0.17, 64, 220]} />
            <meshPhysicalMaterial color="#2449b8" metalness={1} roughness={0.14} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.5} />
          </mesh>
          <mesh ref={thin}>
            <torusGeometry args={[2.85, 0.006, 8, 256]} />
            <meshBasicMaterial color="#93c5fd" transparent opacity={0.4} />
          </mesh>
        </group>
        <mesh position={[1.9, 1.35, 0.4]}>
          <sphereGeometry args={[0.26, 64, 64]} />
          <meshPhysicalMaterial color="#4f8cff" metalness={0.5} roughness={0.1} clearcoat={1} envMapIntensity={1.3} />
        </mesh>
        <mesh position={[-2.2, -1.5, -0.6]}>
          <sphereGeometry args={[0.12, 48, 48]} />
          <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.15} />
        </mesh>
      </Float>
    </group>
  );
}

export function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [lite, setLite] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setLite(window.matchMedia("(max-width: 768px)").matches);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="h-full w-full" data-scene-ready={ready ? "true" : undefined}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={lite ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 7.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#dbeafe" />
        <pointLight position={[-4, -2, 3]} intensity={18} color="#3b82f6" />
        <Environment resolution={128}>
          <Lightformer intensity={2.6} position={[0, 5, -2]} scale={[10, 3, 1]} color="#cfe1ff" />
          <Lightformer intensity={1.4} position={[-5, 0, 0]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#7aa7ff" />
          <Lightformer intensity={1.2} position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#3b6cff" />
          <Lightformer intensity={0.6} position={[0, -5, 2]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#1e3a8a" />
        </Environment>
        <Orbit reduced={reduced} />
        {!lite && <Dust count={140} />}
      </Canvas>
    </div>
  );
}
