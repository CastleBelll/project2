import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useDrag } from "react-dnd";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three'; // THREE import
import "./ArchiveMain.css";

const DraggableImage = ({ id, position, size, scale }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id, position, size, scale },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <mesh
      ref={drag}
      position={position}
      scale={[size * scale, size * scale, 1]} // scale 적용
      rotation={[0, 0, 0]}
      castShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={new THREE.TextureLoader().load(`/images/${id}.png`)}
        transparent={true}
        opacity={isDragging ? 0.5 : 1}
      />
    </mesh>
  );
};

const ArchiveMain = () => {
  const [images, setImages] = useState([]);
  const [scale, setScale] = useState(1);

  // 이미지를 랜덤 위치와 크기로 설정
  useEffect(() => {
    const numImages = 10;
    const newImages = [];

    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * 10 - 5; // -5 ~ 5 범위
      const randomY = Math.random() * 10 - 5;
      const randomSize = Math.random() * 1 + 0.5; // 크기 랜덤
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
      onWheel={handleWheel} // 휠 이벤트 핸들러
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f0f0f0",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10 * scale], fov: 75 }} // 카메라 줌
        style={{ width: "100%", height: "100%" }}
      >
        <OrbitControls /> {/* 3D 컨트롤러 */}
        {images.map(({ id, position, size }) => (
          <DraggableImage
            key={id}
            id={id}
            position={position}
            size={size}
            scale={scale} // 이미지를 드래그할 때 크기 반영
          />
        ))}
        <ambientLight intensity={0.5} /> {/* 주변광 */}
        <directionalLight position={[10, 10, 10]} intensity={1} /> {/* 방향광 */}
      </Canvas>
    </div>
  );
};

export default ArchiveMain;
