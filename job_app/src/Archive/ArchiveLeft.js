import React, { useState } from 'react';
import './ArchiveLeft.css';

function ArchiveLeft({ data, onSubItemClick }) {
  const [openSections, setOpenSections] = useState([]); // 열려 있는 섹션의 ID 저장
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 항목 상태

  const toggleSection = (id) => {
    if (openSections.includes(id)) {
      setOpenSections(openSections.filter((sectionId) => sectionId !== id));
    } else {
      setOpenSections([...openSections, id]);
    }
  };

  const handleSubItemClick = (subItem) => {
    setSelectedItems((prevSelectedItems) => {
      if (!prevSelectedItems.includes(subItem)) {
        return [...prevSelectedItems, subItem]; // 항목 추가
      }
      return prevSelectedItems.filter((item) => item !== subItem); // 항목 제거
    });
    onSubItemClick(subItem); // 부모 컴포넌트로 클릭된 항목 전달
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-top" />
      <div className="sidebar-bottom">
        {data && data.items ? (
          data.items.map((item) => (
            <div key={item.id} className="section">
              <div className="section-title" onClick={() => toggleSection(item.id)}>
                {item.id}. {item.title}
              </div>
              <div className={`sublist ${openSections.includes(item.id) ? 'open' : ''}`}>
                {item.subItems.map((subItem, index) => (
                  <div
                    key={index}
                    className={`subitem ${selectedItems.includes(subItem) ? 'selected' : ''}`}
                    onClick={() => handleSubItemClick(subItem)}
                  >
                    {subItem}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
}

export default ArchiveLeft;
