import React, { useEffect, useRef, useState } from "react";
import { Engine, Render, World, Bodies, Events, Runner, Mouse, MouseConstraint, Query } from "matter-js";
import "./Generator.css";

const Generator = () => {
  const containerRef = useRef(null);
  const textElementsRef = useRef([]);
  const debounceTimer = useRef(null);
  const [data, setData] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // JSON 파일에서 데이터를 가져오는 useEffect
  useEffect(() => {
    fetch("/json/data.json")
      .then((response) => response.json())
      .then((jsonData) => {
        const data = jsonData.map((item) => ({
          category: item.category,
          items: item.items,
        }));
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching the JSON file:", error);
      });
  }, []);

  // 캔버스 크기 업데이트를 위한 useEffect
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (container) {
        setCanvasSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    // 초기 크기 설정
    updateCanvasSize();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", updateCanvasSize);
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;
  
    // 캔버스 초기화 및 설정
    const engine = Engine.create();
    const world = engine.world;
    engine.world.gravity.y = 1;
  
    const render = Render.create({
      element: container,
      engine: engine,
      options: {
        width: canvasSize.width,
        height: canvasSize.height,
        wireframes: false,
        background: "transparent",  // 배경을 투명하게 설정
        pixelRatio: window.devicePixelRatio || 1,
      },
    });
  
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
  
    // 캔버스 경계에 대한 벽 생성
    const width = canvasSize.width;
    const height = canvasSize.height;
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
  
    // 마우스 설정
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, { 
      mouse,
      constraint: { 
        stiffness: 0, // stiffness를 0으로 설정하여 드래그를 방지
        render: { visible: false } // 시각적 효과를 숨길 수 있음
      }
    });
    World.add(world, mouseConstraint);
  
    const handleMouseMove = (e) => {
      if (data.length === 0) return;
  
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        // 화면 크기에 맞춰 마우스 위치 보정
        const mousePos = mouse.position;
        const scaleX = canvasSize.width / window.innerWidth;
        const scaleY = canvasSize.height / window.innerHeight;

        const adjustedX = mousePos.x * scaleX;
        const adjustedY = mousePos.y * scaleY;

        const navbarHeight = 60;
        const maxWidth = 1800;
        const maxHeight = navbarHeight + 200;

        if (adjustedX < 0 || adjustedY < navbarHeight || adjustedX > maxWidth || adjustedY > maxHeight) {
          return; // 영역 밖이면 함수 종료
        }

        const randomCategory = data[Math.floor(Math.random() * data.length)];
        const randomItem = randomCategory.items[Math.floor(Math.random() * randomCategory.items.length)] || "";

        if (randomItem !== "") {
          const size = getRectangleSize(randomItem);
          const angle = (Math.random() - 0.5) * Math.PI; // 랜덤 각도
          const newRectangle = Bodies.rectangle(adjustedX, adjustedY, size.width, size.height, {
            angle: angle,
            chamfer: {
              radius: [20, 20, 20, 20],
            },
            render: {
              fillStyle: "#242424",
              strokeStyle: "#ffffff",
              lineWidth: 2,
            },
            restitution: 0.3,
            friction: 0.05,
            frictionAir: 0.05,
            collisionFilter: {
              group: 1,
            },
            label: randomItem,
          });

          World.add(world, newRectangle);
          textElementsRef.current.push({ body: newRectangle, clicked: false });
        }
      },); // 디바운스 시간 간격
    };
  
    container.addEventListener("mousemove", handleMouseMove);
  
    // Matter.js "beforeUpdate" 이벤트
    Events.on(engine, "beforeUpdate", () => {
      const mousePos = mouse.position;
  
      // 마우스 위치에 있는 물체 찾기
      const hoveredBody = Query.point(textElementsRef.current.map(({ body }) => body), mousePos);
  
      // hover 효과 처리
      textElementsRef.current.forEach(({ body }) => {
        if (hoveredBody.includes(body)) {
          // 호버된 물체의 테두리 색상 변경
          body.render.strokeStyle = "#9746ff";
        } else {
          // 기본 테두리 색상
          body.render.strokeStyle = "#ffffff";
        }
      });
  
      // 클릭 효과 처리 (왼쪽 버튼 클릭)
      if (mouseConstraint.mouse.button === 0) { // 클릭 시
        textElementsRef.current.forEach(({ body, clicked }) => {
          if (hoveredBody.includes(body)) {
            if (!clicked) {
              // 클릭된 물체의 배경색 변경
              body.render.fillStyle = "#9746ff";
              body.render.strokeStyle = "#9746ff";
              // 클릭된 상태로 변경
              textElementsRef.current.find((item) => item.body === body).clicked = true;
            } else {
              // 클릭된 물체를 다시 원래대로 돌려놓기
              body.render.strokeStyle = "#ffffff";
              body.render.fillStyle = "#242424";
              // 클릭되지 않은 상태로 변경
              textElementsRef.current.find((item) => item.body === body).clicked = false;
            }
          }
        });
      }
    });
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
      const context = render.context;
  
      textElementsRef.current.forEach(({ body }) => {
        const { position, angle } = body;
        const randomItem = body.label;
  
        if (randomItem) {
          context.save();
          context.translate(position.x, position.y);
          context.rotate(angle);
          context.fillStyle = "#ffffff";
          context.lineWidth = 1;
          context.font = "18px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(randomItem, 0, 0);
          context.restore();
        }
      });
    });
  
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      container.removeEventListener("mousemove", handleMouseMove);
      textElementsRef.current = [];
      container.innerHTML = "";
    };
  }, [data, canvasSize]);
    
  const getRectangleSize = (text) => {
    const fontSize = 18;
    const paddingX = 18;
    const paddingY = 10;

    const textWidth = fontSize * text.length * 1;
    const textHeight = fontSize;

    return {
      width: textWidth + paddingX * 2,
      height: textHeight + paddingY * 2,
    };
  };

  return <div className="Generator" ref={containerRef}></div>;
};

export default Generator;
