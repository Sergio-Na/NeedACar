// src/components/CarCard.js
import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

const CarCard = ({ car, position }) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    })
    return (
        <Card sx={{ maxWidth: 345, minWidth: 250 }} style={{
            padding: 5, width: 250, height: 290,
            transform: position === 'middle' ? "scale(1)" : position === 'left' ? "scale(0.8) translate(80%)" : "scale(0.8) translate(-80%)",
            zIndex: position === 'middle' ? 3 : 0,
            opacity: position === 'middle' ? 1 : 0.8,
            transition: "transform 0.3s ease", position: 'absolute',
        }}>
            <CardMedia
                sx={{ height: 140 }}
                image="/car.jpeg"
                title="green iguana"
            />
            <CardContent>
                <Typography gutterBottom component="div">
                    {car.Make} {car.Model}
                </Typography>
                <div style={{ display: 'flex', padding: 5, justifyContent: 'space-evenly' }}>
                    <Chip label={car.Type} variant="outlined" />
                    <Chip label={car.Drivetrain} variant="outlined" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{
                        fontWeight: "bold",
                        color: "green",
                        fontSize: "24px",
                    }}>{formattedPrice.format(car.SellingPrice)}</Typography>
                    <CardActions>
                        <Button size="small">More</Button>
                    </CardActions>
                </div>

            </CardContent>
        </Card>
    );
};

export default CarCard;