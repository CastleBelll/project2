import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './ArchiveSelects.css';

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
          spaceBetween={30}
          slidesPerView={3}
          loop={true}
          centeredSlides={true}
          grabCursor={true}
          effect="coverflow"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
            scale: 1.1,
          }}
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
