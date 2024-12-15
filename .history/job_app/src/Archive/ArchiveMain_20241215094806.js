import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [scale, setScale] = useState(1); // 카메라 줌 조절을 위한 상태
  const [images, setImages] = useState([]); // 이미지들 상태

  useEffect(() => {
    // 이미지 랜덤 위치와 크기 설정
    const numImages = 10; // 이미지 개수
    const newImages = [];
    for (let i = 0; i < numImages; i++) {
      const randomX = Math.random() * 10 - 5; // -5 ~ 5 사이의 랜덤 X 좌표
      const randomY = Math.random() * 10 - 5; // -5 ~ 5 사이의 랜덤 Y 좌표
      const randomSize = Math.random() * 1 + 0.5; // 0.5 ~ 1.5 사이의 랜덤 크기
      newImages.push({
        id: i,
        position: [randomX, randomY, 0], // 랜덤 위치
        size: randomSize, // 랜덤 크기
        texture: `/images/${i + 1}.png`, // 텍스처 경로
      });
    }
    setImages(newImages);
  }, []);

  useEffect(() => {
    // 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // 부드러운 빛
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // 카메라 위치 설정
    camera.position.z = 5;

    // 랜덤 위치에 이미지들 추가
    const textureLoader = new THREE.TextureLoader();
    const planes = [];
    images.forEach(({ id, position, size, texture }) => {
      const imageTexture = textureLoader.load(texture);
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshStandardMaterial({
        map: imageTexture,
        transparent: true,
        opacity: 1,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(...position); // 랜덤 위치 설정
      plane.scale.set(size, size, 1); // 랜덤 크기 설정
      planes.push(plane);
      scene.add(plane);
    });

    // 렌더링 함수
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate(); // 애니메이션 루프 시작

    // 마우스 휠 이벤트 처리 (줌)
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
      setScale((prevScale) => Math.min(Math.max(prevScale * zoomFactor, 0.5), 2));
    };

    // 드래그 이벤트 처리
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      camera.position.x -= deltaX * 0.01;
      camera.position.y += deltaY * 0.01;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // 윈도우 사이즈 변경 시 카메라 비율 업데이트
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [images]); // images가 변경될 때마다 효과 실행

  useEffect(() => {
    // 스케일이 바뀌면 카메라의 위치를 업데이트
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5 * scale;
  }, [scale]);

  return (
    <div
      className="archive-main"
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ArchiveMain;
