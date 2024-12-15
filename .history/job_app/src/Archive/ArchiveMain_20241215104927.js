import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import Active from './Archive'; // Active.js 컴포넌트를 import
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [images, setImages] = useState([]); // 이미지들 상태
  const [selectedImage, setSelectedImage] = useState(null); // 클릭된 이미지 상태 추가
  const planesRef = useRef([]); // 이미지들에 대한 참조
  const cameraRef = useRef(null); // 카메라 참조
  const raycasterRef = useRef(new THREE.Raycaster()); // 레이캐스터
  const mouseRef = useRef(new THREE.Vector2()); // 마우스 좌표

  const offsetRef = useRef({ x: 300, y: 80 }); // 마우스 좌표 오프셋
  const zoomRef = useRef(1); // 배율

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
        position: [randomX - offsetRef.current.x / 100, randomY - offsetRef.current.y / 100, 0], // 오프셋 적용
        size: randomSize, // 랜덤 크기
        texture: `/images/${i + 1}.png`, // 텍스처 경로
      });
    }
    setImages(newImages);
  }, []);

  useEffect(() => {
    // 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;

    // OrthographicCamera로 변경
    const camera = new THREE.OrthographicCamera(
      -aspect * 5, // 왼쪽
      aspect * 5,  // 오른쪽
      5,           // 위쪽
      -5,          // 아래쪽
      0.1,         // 가까운 평면
      1000         // 먼 평면
    );
    cameraRef.current = camera; // 카메라 참조 저장
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 배경을 투명하게 설정

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

    // 마우스 이벤트 처리
    const handleMouseMove = (event) => {
      // 화면 좌표에서 [-1, 1] 범위로 변환 (오프셋 고려)
      mouseRef.current.x = ((event.clientX - offsetRef.current.x) / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - offsetRef.current.y) / window.innerHeight) * 2 + 1;
    };

    const handleRaycast = () => {
      // Raycaster에 카메라와 마우스 좌표를 설정
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(planesRef.current);

      // 모든 이미지의 색상을 원래대로 설정
      planesRef.current.forEach((plane) => {
        plane.material.color.set(0xffffff); // 기본 흰색
      });

      if (intersects.length > 0) {
        const intersectedPlane = intersects[0].object;
        intersectedPlane.material.color.set(0x32CD32); // hover된 이미지 초록색으로 변경
      }
    };

    // 클릭 이벤트 처리
    const handleMouseClick = (event) => {
      // Raycaster에 카메라와 마우스 좌표를 설정
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(planesRef.current);

      if (intersects.length > 0) {
        const clickedPlane = intersects[0].object;
        console.log(`Clicked on image with ID: ${clickedPlane.userData.id}`); // 클릭된 이미지의 ID 출력
        setSelectedImage(clickedPlane.userData.id);
      }
    };

    // 드래그 이벤트 처리
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseDrag = (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      // 드래그 중인 이미지 이동
      planesRef.current.forEach((plane) => {
        plane.position.x += deltaX / 100; // 이동 속도 조절
        plane.position.y -= deltaY / 100; // 이동 속도 조절
      });

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    // wheel 이벤트를 통한 배율 조정
    const handleWheel = (event) => {
      if (event.deltaY < 0) {
        zoomRef.current *= 1.1; // 확대
      } else {
        zoomRef.current *= 0.9; // 축소
      }

      // 카메라 비율 적용
      camera.left = -aspect * 5 * zoomRef.current;
      camera.right = aspect * 5 * zoomRef.current;
      camera.top = 5 * zoomRef.current;
      camera.bottom = -5 * zoomRef.current;
      camera.updateProjectionMatrix();
    };

    // 윈도우 사이즈 변경 시 카메라 비율 업데이트
    const handleResize = () => {
      const aspect = window.innerWidth / window.innerHeight;
      camera.left = -aspect * 5 * zoomRef.current;
      camera.right = aspect * 5 * zoomRef.current;
      camera.top = 5 * zoomRef.current;
      camera.bottom = -5 * zoomRef.current;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleMouseDrag); // 드래그 이벤트
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel); // wheel 이벤트로 배율 조정
    window.addEventListener("click", handleMouseClick); // 클릭 이벤트 추가

    const animateRaycast = () => {
      requestAnimationFrame(animateRaycast);
      handleRaycast();
    };

    animateRaycast(); // 마우스 hover 처리 애니메이션 시작

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleMouseDrag);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel); // wheel 이벤트 제거
      window.removeEventListener("click", handleMouseClick); // 클릭 이벤트 제거
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
