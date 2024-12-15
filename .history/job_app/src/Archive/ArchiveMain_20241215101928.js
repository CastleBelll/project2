import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [images, setImages] = useState([]); // 이미지들 상태
  const planesRef = useRef([]); // 이미지들에 대한 참조
  const cameraRef = useRef(null); // 카메라 참조

  useEffect(() => {
    // 이미지 랜덤 위치와 크기 설정
    const numImages = 10; // 이미지 개수
    const newImages = [];
    for (let i = 0; i < numImages; i++) {
      const randomX = Math.random() * 10 - 5; // -5 ~ 5 사이의 랜덤 X 좌표
      const randomY = Math.random() * 10 - 5; // -5 ~ 5 사이의 랜덤 Y 좌표
      const randomSize = Math.random() * 1 + 0.5; // 0.5 ~ 1.5 사이의 랜덤 크기

      // 중앙 위치를 조정: 80px 상단, 300px 왼쪽 오프셋
      const offsetX = 300; // 왼쪽 300px
      const offsetY = 80;  // 상단 80px

      newImages.push({
        id: i,
        position: [randomX - offsetX / 100, randomY - offsetY / 100, 0], // 오프셋 적용
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
    cameraRef.current = camera; // 카메라 참조 저장
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 배경을 투명하게 설정

    // 조명 추가
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
      const material = new THREE.MeshBasicMaterial({
        map: imageTexture,
        transparent: true,
        opacity: 1,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(...position); // 랜덤 위치 설정
      plane.scale.set(size, size, 1); // 랜덤 크기 설정
      plane.userData = { id }; // id를 userData에 저장하여 나중에 사용

      plane.onPointerOver = () => {
        plane.material.color.set(0x8a2be2); // 보라색으로 변경
      };

      plane.onPointerOut = () => {
        plane.material.color.set(0xffffff); // 원래 색상으로 복원
      };

      planes.push(plane);
      scene.add(plane);
    });
    planesRef.current = planes; // planes 참조 저장

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

      // 카메라 줌 업데이트
      camera.position.z = Math.min(Math.max(camera.position.z * zoomFactor, 2), 10);

      // 이미지 크기와 위치 업데이트 (THREE.js 객체의 scale과 position 사용)
      planesRef.current.forEach((plane) => {
        plane.scale.set(plane.scale.x * zoomFactor, plane.scale.y * zoomFactor, 1);

        // 줌에 맞춰 이미지 위치 조정 (스케일에 따라 위치도 비례적으로 이동)
        plane.position.x *= zoomFactor;
        plane.position.y *= zoomFactor;
      });
    };

    // 드래그 이벤트 처리
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      // 마우스 클릭 시작
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;

      // 마우스 이동에 따라 카메라 위치를 업데이트
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      const camera = cameraRef.current;

      // 카메라 이동 속도 조절
      const moveSpeed = 0.01;

      // 카메라의 x, y 위치 조정
      camera.position.x -= deltaX * moveSpeed;
      camera.position.y += deltaY * moveSpeed;

      // 이전 마우스 위치 업데이트
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
    window.addEventListener("wheel", handleWheel, { passive: false });
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
  }, [images]);

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
