import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const sceneRef = useRef(null); // 캔버스를 참조하기 위한 Ref
  const images = ["1.png", "2.png", "3.png", "4.png", "5.png"]; // 이미지 파일 이름 배열
  const scaleRef = useRef(1); // 확대/축소 비율을 관리하는 Ref

  useEffect(() => {
    // Matter.js 필수 구성 요소 초기화
    const engine = Matter.Engine.create();
    const world = engine.world;

    // 렌더러 생성
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "#242424",
        wireframes: false, // 실제 렌더링에 wireframe을 비활성화
      },
    });

    // 이미지 크기 조정 변수
    const IMAGE_WIDTH = 80; // 이미지 너비
    const IMAGE_HEIGHT = 80; // 이미지 높이
    const SCALE_FACTOR = 0.5; // 이미지 축소 비율 (0.5 = 50%)

    // Matter.js Bodies 생성
    const bodies = images.map((image, index) => {
      const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1; // X 위치
      const y = Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1; // Y 위치

      const body = Matter.Bodies.rectangle(x, y, IMAGE_WIDTH, IMAGE_HEIGHT, {
        render: {
          sprite: {
            texture: `/images/${image}`, // 이미지 경로
            xScale: SCALE_FACTOR, // X축 스케일
            yScale: SCALE_FACTOR, // Y축 스케일
          },
        },
        isStatic: false, // 드래그 가능하게 설정
        restitution: 0, // 충돌 반발 없음
      });

      Matter.World.add(world, body); // 월드에 추가
      return body;
    });

    // 마우스 드래그 제어 추가
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2, // 마우스 반응 강도
        render: {
          visible: false, // 드래그 라인 숨김
        },
      },
    });
    Matter.World.add(world, mouseConstraint);

    // 확대/축소 핸들러
    const handleWheel = (event) => {
      event.preventDefault();
      let newScale = scaleRef.current;

      if (event.deltaY < 0) {
        // 확대 (스크롤 업)
        newScale = Math.min(scaleRef.current * 1.1, 3); // 최대 3배 확대
      } else {
        // 축소 (스크롤 다운)
        newScale = Math.max(scaleRef.current * 0.9, 0.5); // 최소 0.5배 축소
      }

      // 적용된 확대/축소 값 저장
      scaleRef.current = newScale;
      render.options.viewport = {
        ...render.options.viewport,
        scale: newScale,
      };
    };

    // 이벤트 리스너 추가
    window.addEventListener("wheel", handleWheel);

    // Matter.js 실행
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    // 클린업 함수
    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.World.clear(world);
      render.canvas.remove();
      render.textures = {};
      window.removeEventListener("wheel", handleWheel); // 이벤트 리스너 제거
    };
  }, [images]);

  return (
    <div ref={sceneRef} className="archive-main" />
  );
};

export default ArchiveMain;