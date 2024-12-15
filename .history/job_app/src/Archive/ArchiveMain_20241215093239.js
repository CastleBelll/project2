import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three"; // THREE import
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // OrbitControls import
import "./ArchiveMain.css";

const DraggableImage = ({ id, position, size, scale }) => {
  const texture = useRef(null);

  useEffect(() => {
    texture.current = new THREE.TextureLoader().load(`/images/${id}.png`);
  }, [id]);

  return (
    <mesh position={position} scale={[size * scale, size * scale, 1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={texture.current}
        transparent={true}
        opacity={1}
      />
    </mesh>
  );
};

const ArchiveMain = () => {
  const [images, setImages] = useState([]);
  const [scale, setScale] = useState(1);

  // 이미지 랜덤 위치와 크기 설정
  useEffect(() => {
    const numImages = 10;
    const newImages = [];

    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * 10 - 5;
      const randomY = Math.random() * 10 - 5;
      const randomSize = Math.random() * 1 + 0.5;
      newImages.push({
        id: i,
        position: [randomX, randomY, 0],
        size: randomSize,
      });
    }

    setImages(newImages);
  }, []);

  // 마우스 휠로 확대/축소
  const handleWheel = (event) => {
    event.preventDefault();

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // 휠 위는 확대, 휠 아래는 축소
    setScale((prevScale) => {
      const newScale = prevScale * zoomFactor;
      return Math.min(Math.max(newScale, 0.5), 2); // 최소 0.5배, 최대 2배
    });
  };

  return (
    <div
      className="archive-main"
      onWheel={handleWheel}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f0f0f0",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10 * scale], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
      >
        <OrbitControls />
        {images.map(({ id, position, size }) => (
          <DraggableImage key={id} id={id} position={position} size={size} scale={scale} />
        ))}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </Canvas>
    </div>
  );
};

export default ArchiveMain;
