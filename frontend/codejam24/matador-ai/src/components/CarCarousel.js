// src/components/CarCarousel.js
import React, { useEffect, useState, useCallback } from 'react';
import './CarCarousel.css';
import CarCard from './CarCard';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const CarCarousel = ({ cars }) => {
  const [currentKey, setCurrentKey] = useState(0);
  const [open, setOpen] = useState(false); // State to manage modal open
  const [selectedCar, setSelectedCar] = useState(null); // State to store selected car

  // Memoized handleSlide function
  const handleSlide = useCallback(
    (inc) => {
      setCurrentKey((prevKey) => {
        if (inc) {
          return prevKey === cars.length - 1 ? 0 : prevKey + 1;
        } else {
          return prevKey === 0 ? cars.length - 1 : prevKey - 1;
        }
      });
    },
    [cars.length] // Dependency array
  );
  const dist = (key) => {
    const diff = (key - currentKey + cars.length) % cars.length;

    if (diff === 0) {
      return 'middle';
    } else if (diff === 1) {
      return 'right';
    } else if (diff === cars.length - 1) {
      return 'left';
    } else {
      return 'hidden';
    }
  };

  const handleMoreClick = (car) => {
    setSelectedCar(car);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCar(null);
  };

  return (
    <><div className="carousel-container" role="region" aria-label="Car Recommendations Carousel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 20 }}>
      {/* Previous Button */}
      <label
        htmlFor="prev"
        className="prev"
        style={{
          padding: 10,
          borderRadius: '50%',
          color: 'white',
          backgroundColor: '#000000CC',
          cursor: 'pointer',
          transition: 'background-color 0.3s, transform 0.3s',
          pointerEvents: 'all'
        }}
        aria-label="Previous Slide"
        onClick={() => handleSlide(false)}
      >
        &#10094;
      </label>

      {/* Carousel Cards */}
      <div className="cards" style={{ height: 350, display: 'flex', width: 600 }}>
        {cars.map((car, index) => <CarCard key={'car-' + index} car={car} position={dist(index)} onMoreClick={handleMoreClick} />)}
      </div>

      {/* Next Button */}
      <label
        htmlFor="next"
        className="next"
        style={{
          padding: 10,
          borderRadius: '50%',
          color: 'white',
          backgroundColor: '#000000CC',
          cursor: 'pointer',
          transition: 'background-color 0.3s, transform 0.3s',
          pointerEvents: 'all'
        }}
        aria-label="Next Slide"
        onClick={() => handleSlide(true)}
      >
        &#10095;
      </label>
    </div>
      {/* Modal Popup */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="car-details-dialog-title"
        fullWidth
        maxWidth="md"
      >
        {selectedCar && (
          <>
            <DialogTitle id="car-details-dialog-title">
              {selectedCar.Make} {selectedCar.Model}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedCar.Image_Link || '/car.jpeg'} // Use dynamic image if available
                    alt={`${selectedCar.Make} ${selectedCar.Model}`}
                    style={{ width: '100%', borderRadius: '8px' }}
                    loading="lazy"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Details
                  </Typography>
                  <Typography variant="body1">
                    <strong>Exterior Color:</strong> {selectedCar.ExteriorColor}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Interior Color:</strong> {selectedCar.InteriorColor}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Transmission:</strong> {selectedCar.Transmission}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Fuel:</strong> {selectedCar.Fuel_Type}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong> {selectedCar.Type}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Drivetrain:</strong> {selectedCar.Drivetrain}
                  </Typography>
                  <Typography variant="body1">
                    <strong>City MPG:</strong> {selectedCar.CityMPG}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Highway MPG:</strong> {selectedCar.HighwayMPG}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Price:</strong> $
                    {selectedCar.SellingPrice.toLocaleString('en-US')}
                  </Typography>
                  {/* Add more details as needed */}
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog></>
  );
};

export default CarCarousel;
