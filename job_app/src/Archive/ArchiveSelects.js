import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // 기본 스타일
import 'swiper/css/effect-coverflow'; // coverflow 효과 스타일
import './ArchiveSelects.css';

import { EffectCoverflow} from 'swiper/modules';

const ArchiveSelects = ({ selectedItemsList }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/json/images.json')
      .then((response) => response.json())
      .then((data) => {
        const filteredImages = data.filter((item) =>
          selectedItemsList.every((selectedItem) =>
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="archive-selects-container">
      {images.length === 0 ? (
        <p>No images found for selected items.</p>
      ) : (
        <Swiper
          spaceBetween={-1000}  // 슬라이드 간의 간격
          slidesPerView={3}  // 화면에 보여질 슬라이드 개수
          loop={true}  // 반복 재생
          centeredSlides={true}  // 가운데 정렬
          grabCursor={true}  // 드래그 커서
          effect="coverflow"  // coverflow 효과 사용
          coverflowEffect={{
            rotate: 10,  // 회전 각도
            stretch: 0,  // 슬라이드 간 간격
            depth: 100,  // 깊이
            modifier: 0,  // 효과 세기 조절
            slideShadows: true,  // 그림자 효과
            scale: 0.7,  // 확대 비율 (중앙 슬라이드는 커지고, 주변 슬라이드는 작아짐)
          }}
          modules={[EffectCoverflow]}
          className="swiper-container"
        >
          {images.map((item, index) => (
            <SwiperSlide key={index} className="swiper-slide">
              <img src={`/images/${item.image}`} alt={item.title} className="carousel-image" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default ArchiveSelects;
