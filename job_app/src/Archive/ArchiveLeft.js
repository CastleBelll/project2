import React, { useState, useEffect } from 'react';
import './ArchiveLeft.css';

function ArchiveLeft({ data, onSubItemClick, selectedItems }) {
  const [localSelectedItems, setLocalSelectedItems] = useState([]); // 선택된 항목 상태
  const [openCategories, setOpenCategories] = useState({}); // 카테고리 열림 상태

  // selectedItems가 빈 배열로 전달되었을 때, 로컬 상태 초기화
  useEffect(() => {
    if (selectedItems.length === 0) {
      setLocalSelectedItems([]); // 빈 배열이면 로컬 선택 항목을 초기화
    } else {
      setLocalSelectedItems(selectedItems); // 부모 컴포넌트에서 전달된 selectedItems 설정
    }
  }, [selectedItems]); // selectedItems가 변경될 때마다 실행

  // 서브 항목 클릭 처리 함수
  const handleSubItemClick = (subItem) => {
    setLocalSelectedItems((prevSelectedItems) => {
      if (!prevSelectedItems.includes(subItem)) {
        return [...prevSelectedItems, subItem]; // 항목 추가
      }
      return prevSelectedItems.filter((item) => item !== subItem); // 항목 제거
    });
    onSubItemClick(subItem); // 부모 컴포넌트로 클릭된 항목 전달
  };

  // 카테고리 열기/닫기 토글 함수
  const toggleCategory = (categoryKey) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey], // 해당 카테고리 상태 토글
    }));
  };

  // 카테고리 값들을 순회하여 하나의 큰 카테고리로 합치는 함수
  const getCategoryItems = (data) => {
    const categoryItems = {};
  
    // 데이터 순회
    data.forEach((item) => {
      Object.keys(item.category).forEach((key) => {
        if (!categoryItems[key]) {
          categoryItems[key] = []; // 카테고리 키가 없으면 초기화
        }
  
        if (item.category[key] && item.category[key].length > 0) {
          // 중복 항목 제거하며 병합
          categoryItems[key] = [
            ...new Set([...categoryItems[key], ...item.category[key]])
          ];
        }
      });
    });
  
    return categoryItems;
  };

  // 카테고리 항목을 순서대로 출력
  const categoryItems = getCategoryItems(data);

  return (
    <div className="sidebar-container">
      <div className="sidebar-top" />
      <div className="sidebar-bottom">
        {Object.keys(categoryItems).map((categoryKey, categoryIndex) => (
          categoryItems[categoryKey].length > 0 && (
            <div key={categoryIndex} className="section">
              <div 
                className="section-title" 
                onClick={() => toggleCategory(categoryKey)} // 카테고리 클릭 시 열고 닫는 기능
              >
                {`${categoryIndex + 1}. ${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}`}
              </div>
              {/* 카테고리가 열려 있는지 확인하여 항목을 표시 */}
              {openCategories[categoryKey] && (
                <div className={`sublist ${openCategories[categoryKey] ? 'open' : ''}`}>
                  {categoryItems[categoryKey].map((subItem, subItemIndex) => (
                    <div
                      key={subItemIndex}
                      className={`subitem ${localSelectedItems.includes(subItem) ? 'selected' : ''}`}
                      onClick={() => handleSubItemClick(subItem)}
                    >
                      {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default ArchiveLeft;
