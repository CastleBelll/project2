import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three"; // THREE import
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei"; // OrbitControls import
import "./ArchiveMain.css";

// 이미지 컴포넌트
const DraggableImage = ({ id, position, size, scale }) => {
  const texture = new THREE.TextureLoader().load(`/images/${id}.png`);
  const meshRef = useRef(null);

  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // 마우스 다운 이벤트로 드래그 시작
  const onPointerDown = (event) => {
    setIsDragging(true);
    setDragStart({
      mouseX: event.clientX,
      mouseY: event.clientY,
      initialPosition: [...position],
    });
  };

  // 마우스 업 이벤트로 드래그 종료
  const onPointerUp = () => {
    setIsDragging(false);
  };

  // 드래그 중인 경우 위치 업데이트
  const onPointerMove = (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - dragStart.mouseX;
    const deltaY = event.clientY - dragStart.mouseY;

    // 3D 좌표로 변환
    const deltaPosition = [
      dragStart.initialPosition[0] + deltaX * 0.01,
      dragStart.initialPosition[1] - deltaY * 0.01, // Y축은 반대로 이동
      dragStart.initialPosition[2],
    ];

    meshRef.current.position.set(...deltaPosition);
  };

  useEffect(() => {
    // 렌더링 시 이벤트 리스너 추가
    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    gl.domElement.addEventListener("pointerup", onPointerUp);
    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.removeEventListener("pointerup", onPointerUp);
    };
  }, [gl.domElement, isDragging, dragStart]);

  return (
    <mesh ref={meshRef} position={position} scale={[size * scale, size * scale, 1]} rotation={[0, 0, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent={true} opacity={1} />
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
