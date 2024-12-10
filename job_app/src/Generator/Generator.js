import React, { useEffect, useRef } from "react";
import { Engine, Render, World, Bodies, Events, Runner } from "matter-js";
import "./Generator.css";

const data = [
  { category: "Character", items: ["노정형", "정철돈", "박재성", "전진", "황광희", "김태균", "김혜자", "정실장", "강호동"] },
  { category: "Emotion", items: ["식탁", "놀람", "만족", "어이없는 상황"] },
];

const Generator = () => {
  const containerRef = useRef(null);
  const textElementsRef = useRef([]);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 캔버스 크기 조정 함수
    const resizeCanvas = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      render.options.width = width;
      render.options.height = height;
      topWall.position.x = width / 2;
      topWall.position.y = -wallThickness / 2;
      bottomWall.position.x = width / 2;
      bottomWall.position.y = height + wallThickness / 2;
      leftWall.position.x = -wallThickness / 2;
      leftWall.position.y = height / 2;
      rightWall.position.x = width + wallThickness / 2;
      rightWall.position.y = height / 2;
    };

    container.innerHTML = "";
    textElementsRef.current = [];

    const engine = Engine.create();
    const world = engine.world;
    engine.world.gravity.y = 1; // 중력 설정

    // 렌더링 최적화 적용
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: container.offsetWidth,
        height: container.offsetHeight,
        wireframes: false, // 와이어프레임 비활성화
        background: "#000000",
        pixelRatio: window.devicePixelRatio || 1, // 적절한 픽셀 비율 사용
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 캔버스 경계에 대한 벽 생성
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const wallThickness = 10;

    const topWall = Bodies.rectangle(width / 2, 0 - wallThickness / 2, width, wallThickness, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const bottomWall = Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const leftWall = Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
      isStatic: true,
      render: { fillStyle: "#ffffff" },
    });

    World.add(world, [topWall, bottomWall, leftWall, rightWall]);

    // 마우스 이동 시 사각형 생성 함수
    const handleMouseMove = (e) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        if (clientX < 0 || clientY < 0 || clientX > rect.width || clientY > rect.height) return;

        const randomCategory = data[Math.floor(Math.random() * data.length)];
        const randomItem = randomCategory.items[Math.floor(Math.random() * randomCategory.items.length)] || "";

        if (randomItem !== "") {
          const size = getRectangleSize(randomItem);
          const angle = (Math.random() - 0.5) * Math.PI; // -45도에서 45도 사이의 랜덤 각도

          const newRectangle = Bodies.rectangle(clientX, clientY, size.width, size.height, {
            angle: angle,
            chamfer: {
              radius: [10, 10], // border-radius 설정이 가능합니다.
            },
            render: {
              fillStyle: "#000000",
              strokeStyle: "#ffffff",
              lineWidth: 1,
            },
            restitution: 0.7, // 반동 속성
            friction: 0.3, // 마찰 속성
            collisionFilter: {
              group: 1,
            },
            label: randomItem,
          });

          World.add(world, newRectangle);
          textElementsRef.current.push({ body: newRectangle });
        }
      },); // 디바운스 시간 간격 적용
    };

    container.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resizeCanvas);

    // 화면 밖 사각형 제거
    Events.on(engine, "beforeUpdate", () => {
      textElementsRef.current = textElementsRef.current.filter(({ body }) => {
        const { x, y } = body.position;
        const isInBounds =
          x > -100 &&
          y > -100 &&
          x < render.options.width + 100 &&
          y < render.options.height + 100;

        if (!isInBounds) {
          World.remove(world, body);
          return false;
        }
        return true;
      });
    });

    Events.on(render, "afterRender", () => {
      const context = render.context; // Canvas rendering context

      // Iterate through all text elements
      textElementsRef.current.forEach(({ body }) => {
        const { position, angle } = body; // Get body position and angle
        const randomItem = body.label; // Use the label property to store the text

        if (randomItem) {
          context.save();
          context.translate(position.x, position.y);
          context.rotate(angle); // Align text rotation with the rectangle
          context.fillStyle = "#ffffff"; // Text color
          context.font = "bold 12px sans-serif"; // Font style
          context.textAlign = "center"; // Center align text
          context.textBaseline = "middle"; // Center text vertically
          context.fillText(randomItem, 0, 0); // Draw the text at the body's position
          context.restore();
        }
      });
    });

    // 컴포넌트 언마운트 시 정리 작업
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
      textElementsRef.current = [];
      container.innerHTML = "";
    };
  }, []);

  const getRectangleSize = (text) => {
    const baseWidth = 60;
    const baseHeight = 20;
    const scale = 1 + text.length / 10;
    return {
      width: baseWidth * scale,
      height: Math.min(baseHeight, 60),
    };
  };

  return <div className="Generator" ref={containerRef}></div>;
};

export default Generator;
