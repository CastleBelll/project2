import React, { useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useNavigate } from 'react-router-dom'; // React Router 사용
import { BsArrowLeft } from 'react-icons/bs'; // 화살표 아이콘 추가
import './ArchiveHeader.css';

function ArchiveHeader({ selectedItems, setSelectedItemsList, setSelectedItems }) {
  const [showBackArrow, setShowBackArrow] = useState(false); // 화살표 표시 여부 상태
  const navigate = useNavigate();

  // 검색 클릭 시
  const handleSearchClick = () => {
    console.log('Selected Items:', selectedItems); // selectedItems 로그 찍기
    setSelectedItemsList(selectedItems); // selectedItems를 selectedItemsList에 저장

    // 검색 후 Archive.js로 이동
    navigate('/archive', {
      state: {
        selectedItemsList: selectedItems, // 검색한 selectedItemsList 전달
        selectedItems: selectedItems, // 검색한 selectedItems 전달
      }
    });
    setShowBackArrow(true); // 검색 클릭 시 화살표 표시
  };

  // 뒤로가기 클릭 시
  const handleBackClick = () => {
    console.log('Resetting selectedItems and selectedItemsList'); // 초기화 전 로그
    setSelectedItems([]);
    setSelectedItemsList([]);
    navigate('/archive', {
      state: {
        selectedItemsList: [], // selectedItemsList를 null로 설정
        selectedItems: [], // selectedItems를 null로 설정
      }
    });
    setShowBackArrow(false); // 화살표 숨기기
  };

  return (
    <div className="archive-header">
      {showBackArrow && (
        <BsArrowLeft
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: '10px', // 왼쪽 여백 추가
            marginRight: '20px',
          }}
          onClick={handleBackClick} // 클릭 시 selectedItemsList를 null로 설정하고 뒤로 가기
        />
      )}
      <TransitionGroup className="selected-items-container">
        {selectedItems.map((item, index) => (
          <CSSTransition
            key={item}
            timeout={500}
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
          onClick={handleSearchClick} // 검색 클릭 이벤트
          style={{ cursor: 'pointer' }}
        >
          검색
        </div>
      )}
    </div>
  );
}

export default ArchiveHeader;
