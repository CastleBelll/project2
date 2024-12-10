import React, { useState } from 'react';
import ArchiveMain from './ArchiveMain';
import ArchiveLeft from './ArchiveLeft';
import ArchiveHeader from './ArchiveHeader';
import './Archive.css';
import data from '/json/data.json'; // 데이터 불러오기

const Archive = () => {
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 하위 항목들 저장

  const handleSubItemClick = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (!prevSelectedItems.includes(item)) {
        return [...prevSelectedItems, item];
      }
      return prevSelectedItems.filter((selectedItem) => selectedItem !== item);
    });
  };

  return (
    <div className="archive-container">
      {/* Left sidebar */}
      <ArchiveLeft data={data} onSubItemClick={handleSubItemClick} className="left-sidebar" />
      
      {/* Right container */}
      <div className="right-container">
        {/* Header */}
        <ArchiveHeader selectedItems={selectedItems} className="header" />
        
        {/* Main content */}
        <ArchiveMain className="main-area" />
      </div>
    </div>
  );
};

export default Archive;
