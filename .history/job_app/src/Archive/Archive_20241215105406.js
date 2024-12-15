import React, { useState, useEffect } from "react";
import ArchiveLeft from "./ArchiveLeft";
import ArchiveHeader from "./ArchiveHeader";
import ArchiveInfo from "./ArchiveInfo"; // ArchiveInfo로 변경
import "./Archive.css";

const Archive = ({ selectedImage }) => {
  const [data, setData] = useState([]); // JSON 데이터를 저장할 상태

  // JSON 파일을 fetch로 불러오는 useEffect
  useEffect(() => {
    fetch("/json/images.json") // public 폴더에서 JSON 파일을 불러옴
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData)) // 데이터가 로드되면 상태에 저장
      .catch((error) => console.error("Error fetching the JSON file:", error));
  }, []); // 컴포넌트가 처음 마운트될 때만 실행

  return (
    <div className="archive-container">
      {/* Left sidebar */}
      <ArchiveLeft data={data} className="left-sidebar" />
      
      {/* Right container */}
      <div className="right-container">
        {/* Header */}
        <ArchiveHeader className="header" />
        
        {/* Main content */}
        <div className="main-area-container" style={{ flex: 1, position: 'relative' }}>
          {/* selectedImage가 있으면 ArchiveInfo에 해당하는 이미지 데이터를 전달 */}
          {selectedImage !== null ? (
            <ArchiveInfo selectedImage={selectedImage} className="main-area" />
          ) : (
            <div>이미지를 선택해 주세요.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;
