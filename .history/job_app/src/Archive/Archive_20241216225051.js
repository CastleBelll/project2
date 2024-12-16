import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ArchiveMain from './ArchiveMain';
import ArchiveLeft from './ArchiveLeft';
import ArchiveHeader from './ArchiveHeader';
import ArchiveInfo from './ArchiveInfo';
import ArchiveSelects from './ArchiveSelects'; // 새 컴포넌트 임포트
import './Archive.css';

const Archive = () => {
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 하위 항목들 저장
  const [selectedImageInfo, setSelectedImageInfo] = useState(null); // 클릭된 이미지 정보 저장
  const [selectedItemsList, setSelectedItemsList] = useState([]); // `selectedItemsList`를 상태로 설정
  const location = useLocation(); // location을 사용하여 Archive.js에 전달된 데이터를 받음
  const [data, setData] = useState([]); // JSON 데이터를 저장할 상태

  useEffect(() => {
    fetch('/json/images.json') // public 폴더에서 JSON 파일을 불러옴
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData)) // 데이터가 로드되면 상태에 저장
      .catch((error) => console.error('Error fetching the JSON file:', error));
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  // Archive.js가 로드될 때, `selectedItemsList`를 받아옵니다.
  useEffect(() => {
    if (location.state && location.state.selectedItemsList) {
      setSelectedItemsList(location.state.selectedItemsList || []); // 전달받은 selectedItemsList를 설정
      setSelectedItems(location.state.selectedItems || []); // 전달받은 selectedItems를 설정
      console.log('Received selectedItemsList:', location.state.selectedItemsList); // 전달된 selectedItemsList 확인
      console.log('Received selectedItems:', location.state.selectedItems); // 전달된 selectedItems 확인
    }
  }, [location.state]);

  const handleSubItemClick = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (!prevSelectedItems.includes(item)) {
        return [...prevSelectedItems, item];
      }
      return prevSelectedItems.filter((selectedItem) => selectedItem !== item);
    });
  };

  const handleSearch = (newSelectedItems) => {
    setSelectedItemsList(newSelectedItems); // ArchiveHeader에서 받은 selectedItems를 set
  };

  return (
    <div className="archive-container">
      {/* Left sidebar */}
      <ArchiveLeft data={data} onSubItemClick={handleSubItemClick} selectedItems={selectedItems} // selectedItems를 ArchiveLeft에 전달
        className="left-sidebar" />

      {/* Right container */}
      <div className="right-container">
        <ArchiveHeader
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setSelectedItemsList={handleSearch} // handleSearch 함수 전달
          className="header"
        />

        {/* Main content */}
        <div className="main-area-container" style={{ flex: 1, position: 'absolute' }}>
          {/* `selectedItemsList`가 비어있지 않으면 ArchiveSelected를 렌더링 */}
          {selectedItemsList.length > 0 ? (
            <ArchiveSelects selectedItemsList={selectedItemsList} className="main-area" />
          ) : selectedImageInfo ? (
            // ArchiveInfo 컴포넌트를 렌더링하며 setSelectedImageInfo 전달
            <ArchiveInfo
              selectedImageInfo={selectedImageInfo}
              setSelectedImageInfo={setSelectedImageInfo}
              className="main-area"
            />
          ) : (
            // ArchiveMain 컴포넌트 렌더링
            <ArchiveMain
              setSelectedImageInfo={setSelectedImageInfo}
              className="main-area"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
