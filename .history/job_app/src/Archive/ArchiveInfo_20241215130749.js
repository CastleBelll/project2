import React, { useState, useEffect } from "react";
import { BsArrowRight } from 'react-icons/bs'; // 우측 화살표 아이콘 가져오기
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
        // selectedImageInfo를 +1하여 해당 이미지를 찾고 상태에 저장
        const selectedImage = jsonData.find((item) => item.image === `${selectedImageInfo + 1}.png`);
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

  // category를 값만 반복하여 표시
  const renderCategory = (category) => {
    // category 객체의 값을 flat으로 펼쳐서 배열로 반환하고 공백 항목 제외
    return Object.values(category)
      .flat()
      .filter((category) => category.trim() !== "") // 공백인 항목은 제외
      .map((category, index) => (
        <div key={index} className="category-item-info">
          {category}
        </div>
      ));
  };

  return (
    <div className="info-container">
      <div className="top-container">
            <div className="top-left-info"></div>
            <div className="divider"></div>  {/* 구분선 추가 */}
            <div className="top-right-info">
                <BsArrowRight style={{ fontSize: '24px' }} />
            </div>
      </div>
      <div className="archive-info">
        <div className="image-container-info">
          <img
            src={`/images/${imageData.image}`}
            alt={imageData.title}
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="content-container-info">
          <div className="title-container-info">
            {imageData.title}
          </div>
          <div className="category-container-info">
            {renderCategory(imageData.category)}
          </div>
          <div className="description-container-info">
            <p>{imageData.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveInfo;
