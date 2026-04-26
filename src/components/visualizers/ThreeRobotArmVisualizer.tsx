import { useEffect, useRef, useState } from "react";
import { Boxes } from "lucide-react";
import * as THREE from "three";

const degToRad = (degree: number) => (degree * Math.PI) / 180;

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <span>
        {label}
        <strong>{value.toFixed(0)} deg</strong>
      </span>
      <input max={180} min={-180} onChange={(event) => onChange(Number(event.target.value))} step={1} type="range" value={value} />
    </label>
  );
}

export function ThreeRobotArmVisualizer() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const jointsRef = useRef<{ joint1?: THREE.Group; joint2?: THREE.Group }>({});
  const [q1, setQ1] = useState(35);
  const [q2, setQ2] = useState(45);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const width = host.clientWidth || 520;
    const height = 320;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbfcfc);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.5, 2.0, 2.2);
    camera.lookAt(0.7, 0, 0.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(3, 4, 5);
    scene.add(light);
    scene.add(new THREE.AxesHelper(1.5));
    const grid = new THREE.GridHelper(3.5, 14, 0xbcc8ca, 0xd8e2e2);
    scene.add(grid);

    const material1 = new THREE.MeshStandardMaterial({ color: 0x0f8b8d, roughness: 0.45 });
    const material2 = new THREE.MeshStandardMaterial({ color: 0xf2a541, roughness: 0.45 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x172026, roughness: 0.3 });
    const linkGeometry = new THREE.BoxGeometry(1.0, 0.08, 0.08);
    const jointGeometry = new THREE.SphereGeometry(0.08, 24, 16);

    const base = new THREE.Mesh(jointGeometry, jointMat);
    scene.add(base);
    const joint1 = new THREE.Group();
    scene.add(joint1);
    const link1 = new THREE.Mesh(linkGeometry, material1);
    link1.position.x = 0.5;
    joint1.add(link1);
    const elbow = new THREE.Mesh(jointGeometry, jointMat);
    elbow.position.x = 1.0;
    joint1.add(elbow);

    const joint2 = new THREE.Group();
    joint2.position.x = 1.0;
    joint1.add(joint2);
    const link2 = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.07, 0.07), material2);
    link2.position.x = 0.36;
    joint2.add(link2);
    const ee = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), material2);
    ee.position.x = 0.72;
    joint2.add(ee);
    jointsRef.current = { joint1, joint2 };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      linkGeometry.dispose();
      jointGeometry.dispose();
      material1.dispose();
      material2.dispose();
      jointMat.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (jointsRef.current.joint1) jointsRef.current.joint1.rotation.z = degToRad(q1);
    if (jointsRef.current.joint2) jointsRef.current.joint2.rotation.z = degToRad(q2);
  }, [q1, q2]);

  const x = Math.cos(degToRad(q1)) + 0.72 * Math.cos(degToRad(q1 + q2));
  const y = Math.sin(degToRad(q1)) + 0.72 * Math.sin(degToRad(q1 + q2));

  return (
    <section className="panel visual-panel">
      <div className="panel-heading">
        <Boxes size={18} aria-hidden />
        <h2>Three.js 3D Robot Arm FK</h2>
      </div>
      <div className="visual-layout">
        <div className="control-stack">
          <Slider label="q1" onChange={setQ1} value={q1} />
          <Slider label="q2" onChange={setQ2} value={q2} />
          <div className="hint-box">end-effector ({x.toFixed(2)}, {y.toFixed(2)}, 0.00)</div>
        </div>
        <div className="plot" ref={hostRef} />
      </div>
    </section>
  );
}

