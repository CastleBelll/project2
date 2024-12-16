import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import "./ArchiveMain.css";
/* eslint-disable */
const ArchiveMain = ({setSelectedImageInfo}) => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [images, setImages] = useState([]); // 이미지들 상태
  const planesRef = useRef([]); // 이미지들에 대한 참조
  const cameraRef = useRef(null); // 카메라 참조
  const raycasterRef = useRef(new THREE.Raycaster()); // 레이캐스터
  const mouseRef = useRef(new THREE.Vector2()); // 마우스 좌표

  const offsetRef = useRef({ x: 300, y: 80 }); // 마우스 좌표 오프셋
  const zoomRef = useRef(1); // 배율

  useEffect(() => {
    // 이미지 랜덤 위치와 크기 설정
    const numImages = 160;
    const newImages = [];
    const aspectRatio = window.innerWidth / window.innerHeight; // 화면 비율 계산
    const widthRange = aspectRatio * 30; // 화면의 가로 범위를 3배로 확장
    const heightRange = 30; // 화면의 세로 범위를 3배로 확장
  
    for (let i = 0; i < numImages; i++) {
      const randomX = Math.random() * widthRange - widthRange / 2; // 가로 범위 조정
      const randomY = Math.random() * heightRange - heightRange / 2; // 세로 범위 조정
      const randomSize = Math.random() * 1.5 + 0.5; // 크기: 최소 0.5배 ~ 최대 1.5배
  
      newImages.push({
        id: i,
        position: [randomX, randomY, 0],
        size: randomSize, // 크기 설정
        texture: `/images/${i + 1}.png`,
      });
    }
  
    // 20~30개 이미지 랜덤 선택
    const selectedImages = newImages.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 11) + 20);
    setImages(selectedImages);
  }, []);
  

  useEffect(() => {
    // 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
  
    const camera = new THREE.OrthographicCamera(
      -aspect * 15, // 기존의 3배 확장
      aspect * 15,
      15,
      -15,
      0.1,
      1000
    );
    cameraRef.current = camera;
  
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
  
    camera.position.z = 5;
  
    const textureLoader = new THREE.TextureLoader();
    const planes = [];
    images.forEach(({ id, position, size, texture }, index) => {
      const imageTexture = textureLoader.load(texture, (loadedTexture) => {
        const image = loadedTexture.image;
        const aspectRatio = image.width / image.height;
  
        const geometry = new THREE.PlaneGeometry(aspectRatio, 1); // 이미지 비율 유지
        const material = new THREE.MeshBasicMaterial({
          map: loadedTexture,
          transparent: true,
          opacity: 1,
        });
  
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(...position);
  
        // 크기 조정
        plane.scale.set(size, size, 1); // 최대 크기 1.5배 반영
  
        // 렌더 순서 지정
        plane.renderOrder = index;
  
        // 사용자 데이터 추가
        plane.userData = { id };
  
        // 씬에 추가 및 참조 배열에 추가
        planes.push(plane);
        scene.add(plane);
      });
    });
    planesRef.current = planes;
  
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
  
    animate();

    // 마우스 이벤트 처리
    const handleMouseMove = (event) => {
      // 화면 좌표에서 [-1, 1] 범위로 변환 (오프셋 고려)
      mouseRef.current.x = ((event.clientX - offsetRef.current.x) / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - offsetRef.current.y) / window.innerHeight) * 2 + 1;
    };

    const handleRaycast = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(planesRef.current);
    
      planesRef.current.forEach((plane) => {
        plane.material.color.set(0xffffff); // 기본 색상
      });
    
      if (intersects.length > 0) {
        intersects.sort((a, b) => b.object.renderOrder - a.object.renderOrder); // 정렬
        const intersectedPlane = intersects[0].object; // 가장 위의 plane
        intersectedPlane.material.color.set(0x32cd32); // hover 색상
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
        setSelectedImageInfo(clickedPlane.userData.id); // 선택된 이미지 정보를 업데이트
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

    const handleWheel = (event) => {
      const canvas = canvasRef.current; // canvasRef를 통해 캔버스 참조 가져오기
      if (!canvas.contains(event.target)) return; // canvas에 마우스가 있을 때만 작동
      if (event.deltaY < 0) {
        zoomRef.current *= 1.1;
      } else {
        zoomRef.current *= 0.9;
      }
  
      const aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.left = -aspect * 5 * zoomRef.current;
      cameraRef.current.right = aspect * 5 * zoomRef.current;
      cameraRef.current.top = 5 * zoomRef.current;
      cameraRef.current.bottom = -5 * zoomRef.current;
      cameraRef.current.updateProjectionMatrix();
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
// eslint-disable-next-line
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
