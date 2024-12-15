import React, { useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './ArchiveHeader.css'; // CSS 파일을 import

function ArchiveHeader({ selectedItems, onSearch }) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    e.preventDefault(); // 기본 드래그 동작 방지
    setIsDragging(true);
    setStartX(e.clientX);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const distance = e.clientX - startX;
    containerRef.current.scrollLeft = scrollLeft - distance;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
  };

  return (
    <div
      className="archive-header overflow-auto"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // 마우스가 컨테이너 밖으로 나갔을 때 드래그 종료
    >
      <TransitionGroup className="selected-items-container">
        {selectedItems.map((item, index) => (
          <CSSTransition
            key={item} // 고유한 키 값
            timeout={500} // 애니메이션 지속 시간
            classNames="item"
            unmountOnExit
          >
            <div className="selected-item">{item}</div>
          </CSSTransition>
        ))}
      </TransitionGroup>
      {selectedItems.length > 0 && (
        <div
          className="search-button"
          onClick={() => onSearch(selectedItems)} // onSearch 실행
          style={{ cursor: 'pointer' }} // 버튼 스타일 변경
        >
          검색
        </div>
      )}
    </div>
  );
}

export default ArchiveHeader;
