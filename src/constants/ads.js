
/**
 * @fileoverview Centralized Ads Data
 */

const TAXI_IMG = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/TAXI.jpg/1280px-TAXI.jpg";

export const ADS_DATA = [
  {
    id: 1,
    title: "Wiki Taxi",
    description: "Réservez votre taxi en un clic",
    image: TAXI_IMG,
    link: "https://play.google.com/store/apps/details?id=com.wikitaxi",
    category: "Transport",
    color: "#f3cd08"
  },
  {
    id: 2,
    title: "Service VIP",
    description: "Le luxe à portée de main",
    image: "https://www.leparisien.fr/resizer/g65uyv7tT0jw3hpe7AJb5r4FRZM=/932x582/arc-anglerfish-eu-central-1-prod-leparisien.s3.amazonaws.com/public/ILSOWNDOZ4QWIEHAVX4Z336MZI.jpg",
    link: "#",
    category: "Premium",
    color: "#141414"
  },
  {
    id: 3,
    title: "Eco Ride",
    description: "Moins de CO2, plus de confort",
    image: "https://images.radio-canada.ca/q_auto,w_700/v1/ici-info/16x9/taxi-jaune.jpg",
    link: "#",
    category: "Eco",
    color: "#22c55e"
  }
];
