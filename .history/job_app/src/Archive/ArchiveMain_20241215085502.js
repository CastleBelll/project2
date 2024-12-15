import React, { useEffect, useRef, useState } from "react";
import "./ArchiveMain.css";

const ArchiveMain = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1); // 배율 상태

  useEffect(() => {
    const container = containerRef.current;
    const numImages = 10; // 배치할 이미지 개수
    const images = [];

    const occupiedPositions = []; // 이미지가 이미 배치된 위치 저장

    for (let i = 1; i <= numImages; i++) {
      const img = document.createElement("img");
      img.src = `/images/${i}.png`; // public/images 폴더 내 1.png, 2.png 등의 파일
      img.alt = `Image ${i}`;
      img.className = "archive-image";
      img.style.objectFit = "contain"; // 비율 유지

      let randomX, randomY;
      let isOverlapping;

      // 랜덤 위치 지정 (이미지 간 겹치지 않도록 조정)
      do {
        randomX = Math.random() * container.offsetWidth; // 0 ~ container width
        randomY = Math.random() * container.offsetHeight; // 0 ~ container height

        isOverlapping = occupiedPositions.some(pos => {
          const distance = Math.sqrt(
            Math.pow(randomX - pos.x, 2) + Math.pow(randomY - pos.y, 2)
          );
          return distance < 10; // 최소 거리 (픽셀 단위)
        });
      } while (isOverlapping);

      occupiedPositions.push({ x: randomX, y: randomY });

      // 랜덤 크기 지정 (50px ~ 150px)
      const randomSize = Math.floor(Math.random() * 100) + 50;
      img.style.width = `${randomSize}px`;
      img.style.height = `${randomSize}px`;

      // 위치 설정
      img.style.position = "absolute";
      img.style.top = `${randomY}px`;
      img.style.left = `${randomX}px`;

      // 중앙에서 벗어난 보정 (이미지 크기 반영)
      img.style.transform = `translate(-${randomSize / 2}px, -${randomSize / 2}px)`;

      // 드래그 앤 드롭 기능 추가
      img.draggable = true;

      let offsetX = 0;
      let offsetY = 0;

      img.addEventListener("dragstart", (event) => {
        offsetX = event.clientX - img.getBoundingClientRect().left;
        offsetY = event.clientY - img.getBoundingClientRect().top;
        event.dataTransfer.setData("text/plain", "");
        event.target.style.transition = "none"; // 드래그 시작 시 애니메이션 제거
      });

      img.addEventListener("drag", (event) => {
        if (event.clientX && event.clientY) {
          const newLeft = event.clientX - container.offsetLeft - offsetX;
          const newTop = event.clientY - container.offsetTop - offsetY;

          img.style.left = `${newLeft}px`;
          img.style.top = `${newTop}px`;
        }
      });

      img.addEventListener("dragend", (event) => {
        event.target.style.transition = "all 0.1s ease"; // 드래그 종료 후 애니메이션 복원
        const newLeft = event.clientX - container.offsetLeft - offsetX;
        const newTop = event.clientY - container.offsetTop - offsetY;

        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
      });

      images.push(img);
      container.appendChild(img);
    }

    // 마우스 휠 이벤트로 배율 조정
    const handleWheel = (event) => {
      const delta = event.deltaY;
      setScale(prevScale => {
        let newScale = prevScale + (delta > 0 ? -0.1 : 0.1);
        newScale = Math.min(Math.max(newScale, 0.5), 2); // 배율 제한 (0.5배 ~ 2배)
        return newScale;
      });
    };

    container.addEventListener("wheel", handleWheel);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      images.forEach(img => container.removeChild(img));
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="archive-main"
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    ></div>import React, { useEffect, useRef, useState } from "react";
    import "./ArchiveMain.css";
    
    const ArchiveMain = () => {
      const containerRef = useRef(null);
      const [scale, setScale] = useState(1); // 배율 상태
    
      useEffect(() => {
        const container = containerRef.current;
        const numImages = 10; // 배치할 이미지 개수
        const images = [];
    
        const occupiedPositions = []; // 이미지가 이미 배치된 위치 저장
    
        for (let i = 1; i <= numImages; i++) {
          const img = document.createElement("img");
          img.src = `/images/${i}.png`; // public/images 폴더 내 1.png, 2.png 등의 파일
          img.alt = `Image ${i}`;
          img.className = "archive-image";
          img.style.objectFit = "contain"; // 비율 유지
    
          let randomX, randomY;
          let isOverlapping;
    
          // 랜덤 위치 지정 (이미지 간 겹치지 않도록 조정)
          do {
            randomX = Math.random() * container.offsetWidth; // 0 ~ container width
            randomY = Math.random() * container.offsetHeight; // 0 ~ container height
    
            isOverlapping = occupiedPositions.some(pos => {
              const distance = Math.sqrt(
                Math.pow(randomX - pos.x, 2) + Math.pow(randomY - pos.y, 2)
              );
              return distance < 10; // 최소 거리 (픽셀 단위)
            });
          } while (isOverlapping);
    
          occupiedPositions.push({ x: randomX, y: randomY });
    
          // 랜덤 크기 지정 (50px ~ 150px)
          const randomSize = Math.floor(Math.random() * 100) + 50;
          img.style.width = `${randomSize}px`;
          img.style.height = `${randomSize}px`;
    
          // 위치 설정
          img.style.position = "absolute";
          img.style.top = `${randomY}px`;
          img.style.left = `${randomX}px`;
    
          // 중앙에서 벗어난 보정 (이미지 크기 반영)
          img.style.transform = `translate(-${randomSize / 2}px, -${randomSize / 2}px)`;
    
          // 드래그 앤 드롭 기능 추가
          img.draggable = true;
    
          let offsetX = 0;
          let offsetY = 0;
    
          img.addEventListener("dragstart", (event) => {
            offsetX = event.clientX - img.getBoundingClientRect().left;
            offsetY = event.clientY - img.getBoundingClientRect().top;
            event.dataTransfer.setData("text/plain", "");
            event.target.style.transition = "none"; // 드래그 시작 시 애니메이션 제거
          });
    
          img.addEventListener("drag", (event) => {
            if (event.clientX && event.clientY) {
              const newLeft = event.clientX - container.offsetLeft - offsetX;
              const newTop = event.clientY - container.offsetTop - offsetY;
    
              img.style.left = `${newLeft}px`;
              img.style.top = `${newTop}px`;
            }
          });
    
          img.addEventListener("dragend", (event) => {
            event.target.style.transition = "all 0.1s ease"; // 드래그 종료 후 애니메이션 복원
            const newLeft = event.clientX - container.offsetLeft - offsetX;
            const newTop = event.clientY - container.offsetTop - offsetY;
    
            img.style.left = `${newLeft}px`;
            img.style.top = `${newTop}px`;
          });
    
          images.push(img);
          container.appendChild(img);
        }
    
        // 마우스 휠 이벤트로 이미지 배율 조정
        const handleWheel = (event) => {
          const delta = event.deltaY;
          setScale(prevScale => {
            let newScale = prevScale + (delta > 0 ? -0.1 : 0.1);
            newScale = Math.min(Math.max(newScale, 0.5), 2); // 배율 제한 (0.5배 ~ 2배)
            return newScale;
          });
        };
    
        container.addEventListener("wheel", handleWheel);
    
        return () => {
          container.removeEventListener("wheel", handleWheel);
          images.forEach(img => container.removeChild(img));
        };
      }, []);
    
      return (
        <div ref={containerRef} className="archive-main">
          {React.Children.map(images, (img) => {
            return React.cloneElement(img, {
              style: {
                ...img.style,
                transform: `scale(${scale}) translate(-${img.width / 2}px, -${img.height / 2}px)`
              }
            });
          })}
        </div>
      );
    };
    
    export default ArchiveMain;
    
  );
};

export default ArchiveMain;
