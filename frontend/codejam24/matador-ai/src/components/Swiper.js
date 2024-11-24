import CarCard from './CarCard';
import './Swiper.css'


const Swiper = ({ cars }) => {

    return (
        <div class="swiper-container two">
            <div class="swiper-wrapper">
                {cars.map((car) =>
                    <div class="swiper-slide"><CarCard car={car} /></div>
                )}
            </div>
            <div class="swiper-pagination"></div>
        </div>
    )
}

export default Swiper;