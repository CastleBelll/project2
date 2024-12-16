import React, { useState, useEffect } from "react";
import { BsArrowLeft } from 'react-icons/bs';
import './ArchiveInfo.css';

const ArchiveInfo = ({ selectedImageInfo, setSelectedImageInfo }) => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    fetch('/json/images.json')
      .then((response) => response.json())
      .then((jsonData) => {
        const selectedImage = jsonData.find((item) => item.image === `${selectedImageInfo + 1}.png`);
        if (selectedImage) {
          setImageData(selectedImage);
        } else {
          console.error("Selected image not found: ", selectedImageInfo);
        }
      })
      .catch((error) => console.error('Error fetching the JSON file:', error));
  }, [selectedImageInfo]);

  if (!imageData) {
    return <div></div>;
  }

  // 화살표 버튼 클릭 시 selectedImageInfo를 null로 설정
  const handleBackClick = () => {
    setSelectedImageInfo(null);
  };

  return (
    <div className="info-container">
      <div className="top-container">
        <div className="top-left-info"></div>
        <div className="divider"></div>
        <div className="top-right-info">
          <BsArrowLeft
            style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleBackClick} // 클릭 시 selectedImageInfo를 null로 설정
          />
          {imageData.title}
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
            {Object.values(imageData.category).flat().map((category, index) => (
              <div key={index} className="category-item-info">
                {category}
              </div>
            ))}
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
