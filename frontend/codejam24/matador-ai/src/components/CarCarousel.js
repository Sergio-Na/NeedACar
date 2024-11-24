// src/components/CarCarousel.js
import React, { useEffect, useState } from 'react';
import './CarCarousel.css';
import CarCard from './CarCard';

const CarCarousel = ({ cars }) => {
  const [currentKey, setCurrentKey] = useState(0);

  const handleSlide = (inc) => {
    if (inc) {
      if (currentKey === cars.length - 1) {
        setCurrentKey(0)
      } else {
        setCurrentKey(currentKey + 1)
      }
    } else {
      if (currentKey === 0) {
        setCurrentKey(cars.length - 1)
      } else {
        setCurrentKey(currentKey - 1)
      }
    }

  }

  console.log('key', currentKey)

  return (
    <div className="carousel-container" role="region" aria-label="Car Recommendations Carousel">
      {/* Radio Buttons */}
      <input type="radio" name="slider" id="item-1" defaultChecked />
      <input type="radio" name="slider" id="item-2" />
      <input type="radio" name="slider" id="item-3" />

      {/* Carousel Cards */}
      <div className="cards" style={{ height: 350, display: 'flex', flexGrow: 1 }}>
        {cars.map((car, index) => <CarCard key={'car-' + index} car={car} position={currentKey - index === 0 ? 'middle' : currentKey - index < 0 ? 'right' : 'left'} />)}

      </div>

      {/* Navigation Buttons */}
      <div className="carousel-navigation">
        {/* Previous Button */}
        <label
          htmlFor="prev"
          className="prev"
          aria-label="Previous Slide"
          onClick={() => handleSlide(false)}
        >
          &#10094;
        </label>
        {/* Next Button */}
        <label
          htmlFor="next"
          className="next"
          aria-label="Next Slide"
          onClick={() => handleSlide(true)}
        >
          &#10095;
        </label>
      </div>
    </div>
  );
};

export default CarCarousel;
