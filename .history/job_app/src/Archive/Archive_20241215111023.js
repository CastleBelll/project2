import React, { useState, useEffect } from 'react';
import ArchiveMain from './ArchiveMain';
import ArchiveLeft from './ArchiveLeft';
import ArchiveHeader from './ArchiveHeader';
import ArchiveInfo from './ArchiveInfo';

import './Archive.css';

const Archive = () => {
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 하위 항목들 저장
  const [selectedImageInfo, setSelectedImageInfo] = useState(null); // 선택된 이미지 정보 저장
  const [data, setData] = useState([]); // JSON 데이터를 저장할 상태

  // JSON 파일을 fetch로 불러오는 useEffect
  useEffect(() => {
    fetch('/json/images.json') // public 폴더에서 JSON 파일을 불러옴
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData)) // 데이터가 로드되면 상태에 저장
      .catch((error) => console.error('Error fetching the JSON file:', error));
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

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
        <div className="main-area-container" style={{ flex: 1, position: 'relative' }}>
          {/* If there are selected items, show ArchiveInfo, otherwise show ArchiveMain */}
          {selectedImageInfo ? (
            <ArchiveInfo selectedImageInfo={selectedImageInfo} className="main-area" />
          ) : (
            <ArchiveMain setSelectedImageInfo={setSelectedImageInfo} className="main-area" />
          )}
        </div>
        </div>
    </div>
  );
};

export default Archive;
