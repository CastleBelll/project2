import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const sceneRef = useRef(null); // 캔버스를 참조하기 위한 Ref
  const images = ["1.png", "2.png", "3.png", "4.png", "5.png"]; // 이미지 파일 이름 배열

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

    // Matter.js Bodies 생성
    const bodies = images.map((image, index) => {
      const x = Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1; // X 위치
      const y = Math.random() * window.innerHeight * 0.8 + window.innerHeight * 0.1; // Y 위치

      const body = Matter.Bodies.rectangle(x, y, 100, 100, {
        render: {
          sprite: {
            texture: `/images/${image}`, // 이미지 경로
            xScale: 1, // 이미지 크기 조정
            yScale: 1,
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
    };
  }, [images]);

  return (
    <div ref={sceneRef} className="archive-main" />
  );
};

export default ArchiveMain;
