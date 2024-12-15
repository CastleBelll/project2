import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [scale, setScale] = useState(1); // 카메라 줌 조절을 위한 상태
  const [images, setImages] = useState([]); // 이미지들 상태
  const [activeImage, setActiveImage] = useState(null); // 드래그 중인 이미지 상태
  const [scene, setScene] = useState(null); // scene 객체를 상태로 관리

  useEffect(() => {
    // 씬, 카메라, 렌더러 설정
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 배경을 투명하게 설정

    console.log("씬, 카메라, 렌더러 설정 완료");

    // 조명 추가
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // 카메라 위치 설정
    camera.position.z = 5;

    // 랜덤 위치에 이미지들 추가
    const textureLoader = new THREE.TextureLoader();
    const planes = [];
    const initialImages = [];
    for (let i = 0; i < 10; i++) {
      const randomX = Math.random() * 10 - 5;
      const randomY = Math.random() * 10 - 5;
      const randomSize = Math.random() * 1 + 0.5;
      const imageTexture = textureLoader.load(`/images/${i + 1}.png`);
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshStandardMaterial({
        map: imageTexture,
        transparent: true,
        opacity: 1,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(randomX, randomY, 0);
      plane.scale.set(randomSize, randomSize, 1);
      plane.userData = { id: i };
      planes.push(plane);
      initialImages.push({
        id: i,
        mesh: plane, // 메쉬 객체도 저장
        position: [randomX, randomY, 0],
        size: randomSize,
      });
      scene.add(plane);
    }
    setScene(scene);
    setImages(initialImages);

    // 렌더링 함수
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate(); // 애니메이션 루프 시작

    // 휠 이벤트 처리
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.5), 2);
        console.log("줌 스케일 변경:", newScale);
        // 각 이미지의 크기 업데이트
        images.forEach((image) => {
          image.mesh.scale.set(image.mesh.scale.x * zoomFactor, image.mesh.scale.y * zoomFactor, 1);
        });
        return newScale;
      });
    };

    // 드래그 이벤트 처리
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event) => {
      console.log("마우스 다운:", event.clientX, event.clientY);
      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const clickedImage = intersects[0].object;
        console.log("드래그 시작한 이미지:", clickedImage);
        setActiveImage(clickedImage);
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseMove = (event) => {
      if (!isDragging || !activeImage) return;
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      activeImage.position.x += deltaX * 0.01;
      activeImage.position.y -= deltaY * 0.01;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      console.log("이미지 드래그 위치:", activeImage.position);
    };

    const handleMouseUp = () => {
      console.log("마우스 업");
      isDragging = false;
      setActiveImage(null);
    };

    // 윈도우 리사이즈 시 카메라 비율 업데이트
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      console.log("윈도우 리사이즈됨");
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
  }, [images, activeImage]); // images나 activeImage가 변경될 때마다 실행

  useEffect(() => {
    // 스케일이 바뀌면 카메라의 위치를 업데이트
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5 * scale;
    console.log("카메라 위치 변경:", camera.position.z);
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
