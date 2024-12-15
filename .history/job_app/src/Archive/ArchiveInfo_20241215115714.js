import React, { useState, useEffect } from "react";
import './ArchiveInfo.css'; // 스타일을 별도의 CSS 파일로 관리할 수 있습니다.

const ArchiveInfo = ({ selectedImageInfo }) => {
  const [imageData, setImageData] = useState(null);  // 이미지 데이터를 저장할 상태

  // JSON 파일을 fetch로 불러오는 useEffect
  useEffect(() => {
    console.log("selectedImageInfo: ", selectedImageInfo);  // selectedImageInfo 값 확인
    fetch('/json/images.json')  // public 폴더에서 JSON 파일을 불러옴
      .then((response) => response.json())
      .then((jsonData) => {
        console.log("Fetched JSON data: ", jsonData);  // JSON 데이터 확인
        // selectedImageInfo를 이용하여 해당 이미지를 찾고 상태에 저장
        const selectedImage = jsonData.find((item) => item.image === `${selectedImageInfo}.png`);
        if (selectedImage) {
          setImageData(selectedImage);  // 해당 데이터를 상태에 설정
        } else {
          console.error("Selected image not found: ", selectedImageInfo);
        }
      })
      .catch((error) => console.error('Error fetching the JSON file:', error));
  }, [selectedImageInfo]);  // selectedImageInfo가 변경될 때마다 실행

  // 이미지 데이터가 없으면 로딩 중일 수 있으므로 조건 처리
  if (!imageData) {
    return <div>Loading...</div>;
  }

  // category를 문자열 형태로 변환하여 표시
  const renderCategory = (category) => {
    let categoryList = [];
    Object.keys(category).forEach((key) => {
      category[key].forEach((item) => {
        categoryList.push(`${key}: ${item}`);
      });
    });
    return categoryList.join(', ');
  };

  return (
    <div className="info-container">
      <div className="top-container">
        {/* 상단에 추가 요소가 있을 수 있음 */}
      </div>
      <div className="archive-info">
        <h2>{imageData.title}</h2>
        <img
          src={`/images/${imageData.image}`}  // JSON 데이터의 'image' 필드에 맞는 이미지 URL
          alt={imageData.title}  // alt 텍스트에 제목 사용
          style={{ width: "100%", maxWidth: "500px", height: "auto" }}
        />
        <p><strong>Category:</strong> {renderCategory(imageData.category)}</p>
        <p>{imageData.description}</p>
      </div>
    </div>
  );
};

export default ArchiveInfo;
