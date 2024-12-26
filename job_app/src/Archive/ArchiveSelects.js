import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import './ArchiveSelects.css';
import { EffectCoverflow } from 'swiper/modules';

const ArchiveSelects = ({ selectedItemsList, setSelectedImageInfo }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startX, setStartX] = useState(0); // 마우스 시작 위치 저장
  const [startY, setStartY] = useState(0); // 마우스 시작 위치 저장

  useEffect(() => {
    fetch('/json/images.json')
      .then((response) => response.json())
      .then((data) => {
        const filteredImages = data.filter((item) =>
          selectedItemsList.some((selectedItem) =>
            Object.values(item.category).some((categoryValues) =>
              categoryValues.includes(selectedItem)
            )
          )
        );
        setImages(filteredImages);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching the JSON file:', error);
        setLoading(false);
      });
  }, [selectedItemsList]);

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="archive-selects-container">
      {images.length === 0 ? (
        <p>No images found for selected items.</p>
      ) : (
        <Swiper
          spaceBetween={-500}
          slidesPerView={3}
          loop={true}
          centeredSlides={true}
          grabCursor={true} // 드래그 커서 유지
          effect="coverflow"
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 100,
            modifier: 0,
            slideShadows: true,
            scale: 0.7,
          }}
          modules={[EffectCoverflow]}
          className="swiper-container"
        >
          {images.map((item, index) => (
            <SwiperSlide key={index} className="swiper-slide">
<img
  src={`/images/${item.image}`}
  alt={item.title}
  className="carousel-image"
  loading="lazy"
  onClick={() => {
    // Swiper 이벤트와 겹치지 않게 onClick 사용
    setSelectedImageInfo(item.image); // 클릭으로 간주해 이벤트 처리
    console.log('Selected Image Info:', item.image);
  }}
  onMouseDown={(e) => {
    e.stopPropagation(); // Swiper 이벤트와 충돌 방지
    setStartX(e.clientX); // 마우스 클릭 시작 X 좌표 저장
    setStartY(e.clientY); // 마우스 클릭 시작 Y 좌표 저장
  }}
  onMouseUp={(e) => {
    e.stopPropagation(); // Swiper 이벤트와 충돌 방지
    const endX = e.clientX; // 마우스 클릭 종료 X 좌표
    const endY = e.clientY; // 마우스 클릭 종료 Y 좌표

    // 클릭인지 드래그인지 판단 (좌표 변화가 미세하면 클릭으로 간주)
    if (Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5) {
      setSelectedImageInfo(item.image);
      console.log('Selected Image Info:', item.image);
    }
  }}
/>

            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ArchiveSelects;
