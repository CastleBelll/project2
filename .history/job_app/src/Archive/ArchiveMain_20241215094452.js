import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const canvasRef = useRef(null); // three.js 렌더링을 위한 canvas
  const [scale, setScale] = useState(1); // 카메라 줌 조절을 위한 상태

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

    // 이미지 텍스처와 메쉬 추가
    const textureLoader = new THREE.TextureLoader();
    const imageTexture = textureLoader.load("/images/1.png");

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      map: imageTexture,
      transparent: true,
      opacity: 1,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, 0); // 위치 설정
    scene.add(plane);

    // 카메라 위치 설정
    camera.position.z = 5;

    // 렌더링 함수
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate(); // 애니메이션 루프 시작

    // 마우스 휠 이벤트 처리
    const handleWheel = (event) => {
      event.preventDefault();
      const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
      setScale((prevScale) => Math.min(Math.max(prevScale * zoomFactor, 0.5), 2));
    };

    // 윈도우 사이즈 변경 시 카메라 비율 업데이트
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
        background: "#f0f0f0",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ArchiveMain;
