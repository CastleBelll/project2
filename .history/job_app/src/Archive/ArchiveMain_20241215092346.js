import React, { useState, useEffect, useContext } from "react";
import { Canvas } from "@react-three/fiber";
import { useDrag } from "react-dnd";
import { OrbitControls } from "@react-three/drei";
import * as THREE from 'three';
import "./ArchiveMain.css";

// DraggableImage 컴포넌트
const DraggableImage = ({ id, position, size }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id, position, size },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <mesh
      ref={drag}
      position={position}
      scale={[size, size, 1]}
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
  const [scale, setScale] = useState(1); // 확대/축소 비율 상태

  // 이미지 랜덤 배치
  useEffect(() => {
    const numImages = 10; // 배치할 이미지 개수
    const newImages = [];

    for (let i = 1; i <= numImages; i++) {
      const randomX = Math.random() * 10 - 5; // -5 ~ 5 범위
      const randomY = Math.random() * 10 - 5;
      const randomSize = Math.random() * 1 + 0.5; // 0.5 ~ 1.5
      newImages.push({
        id: i,
        position: [randomX, randomY, 0], // 3D 위치
        size: randomSize,
      });
    }

    setImages(newImages);
  }, []);

  // 마우스 휠 이벤트 처리 (컨테이너의 배율 변경)
  const handleWheel = (event) => {
    event.preventDefault(); // 기본 동작 방지 (페이지 스크롤 방지)
    
    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // 휠 위는 확대, 휠 아래는 축소
    setScale((prevScale) => {
      const newScale = prevScale * zoomFactor;
      return Math.min(Math.max(newScale, 0.5), 2);
    });
  };

  return (
    <div
      className="archive-main"
      onWheel={handleWheel}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f0f0f0", // 배경 색
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        onWheel={handleWheel}
        style={{ width: "100%", height: "100%" }}
      >
        {/* 카메라 회전 컨트롤 */}
        <OrbitControls />

        {/* 3D 이미지들 렌더링 */}
        {images.map(({ id, position, size }) => (
          <DraggableImage key={id} id={id} position={position} size={size} />
        ))}

        {/* 빛 추가 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
      </Canvas>
    </div>
  );
};

export default ArchiveMain;
