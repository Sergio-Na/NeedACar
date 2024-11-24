// src/components/CarCarousel.js
import React, { useEffect, useState } from 'react';
import './CarCarousel.css';
import CarCard from './CarCard';

const CarCarousel = ({ cars }) => {
  const [currentKey, setCurrentKey] = useState(0);

  return (
    <div className="carousel-container" role="region" aria-label="Car Recommendations Carousel">
      {/* Radio Buttons */}
      <input type="radio" name="slider" id="item-1" defaultChecked />
      <input type="radio" name="slider" id="item-2" />
      <input type="radio" name="slider" id="item-3" />

      {/* Carousel Cards */}
      <div className="cards">
        {cars.map((car, index) => <CarCard key={'car-' + index} car={car} />)}

      </div>

      {/* Navigation Buttons */}
      <div className="carousel-navigation">
        {/* Previous Button */}
        <label
          htmlFor="prev"
          className="prev"
          aria-label="Previous Slide"
          onClick={() => {
            const checkedRadio = document.querySelector('input[name="slider"]:checked');
            if (checkedRadio) {
              // checkedRadio.id
              document.getElementById()
              if (checkedRadio.id === 'item-1') {
                document.getElementById('item-3').checked = true;
              } else if (checkedRadio.id === 'item-2') {
                document.getElementById('item-1').checked = true;
              } else if (checkedRadio.id === 'item-3') {
                document.getElementById('item-2').checked = true;
              }
            }
          }}
        >
          &#10094;
        </label>
        {/* Next Button */}
        <label
          htmlFor="next"
          className="next"
          aria-label="Next Slide"
          onClick={() => {
            const checkedRadio = document.querySelector('input[name="slider"]:checked');
            if (checkedRadio) {
              if (checkedRadio.id === 'item-1') {
                document.getElementById('item-2').checked = true;
              } else if (checkedRadio.id === 'item-2') {
                document.getElementById('item-3').checked = true;
              } else if (checkedRadio.id === 'item-3') {
                document.getElementById('item-1').checked = true;
              }
            }
          }}
        >
          &#10095;
        </label>
      </div>
    </div>
  );
};

export default CarCarousel;
