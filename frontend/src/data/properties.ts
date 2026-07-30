export interface Property {
  id: string;
  name: string;
  price: number;
  location: string;
  state: string;
  suites: number;
  bathrooms: number;
  area: number;
  parking: number;
  type: string;
  status: string;
  image: string;
  isPinnacle?: boolean;
  isVerified?: boolean;
  isExclusive?: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  images: string[];
}

import prop1 from "../assets/images/prop-1.png";
import prop2 from "../assets/images/prop-2.png";
import prop3 from "../assets/images/prop-3.png";
import prop4 from "../assets/images/prop-4.png";
import prop5 from "../assets/images/prop-5.png";
import prop6 from "../assets/images/prop-6.png";
import propHero from "../assets/images/prop-detail-hero.png";

export const properties: Property[] = [
  {
    id: "1",
    name: "Iconic Residence",
    price: 28000000,
    location: "Jardins",
    state: "SP",
    suites: 4,
    bathrooms: 5,
    area: 650,
    parking: 6,
    type: "Apartment",
    status: "For Sale",
    image: propHero,
    isPinnacle: true,
    isVerified: true,
    isExclusive: true,
    isActive: true,
    isSelected: true,
    images: [propHero, prop1, prop2, prop3, prop4, prop5]
  },
  {
    id: "2",
    name: "Residência Ocean Light",
    price: 7850000,
    location: "Balneário Camboriú",
    state: "SC",
    suites: 4,
    bathrooms: 6,
    area: 482,
    parking: 4,
    type: "Apartment",
    status: "For Sale",
    image: prop1,
    isPinnacle: true,
    isVerified: true,
    isActive: true,
    isSelected: true,
    images: [prop1, prop2, prop3]
  },
  {
    id: "3",
    name: "Reserva à Beira-Mar Lumina",
    price: 6420000,
    location: "Salvador",
    state: "BA",
    suites: 4,
    bathrooms: 5,
    area: 350,
    parking: 3,
    type: "Apartment",
    status: "For Sale",
    image: prop2,
    isPinnacle: true,
    isVerified: true,
    isActive: true,
    images: [prop2, prop4, prop5]
  },
  {
    id: "4",
    name: "Cobertura Gourmet Horizon",
    price: 5980000,
    location: "Moema",
    state: "SP",
    suites: 3,
    bathrooms: 4,
    area: 270,
    parking: 3,
    type: "Penthouse",
    status: "For Sale",
    image: prop3,
    isVerified: true,
    images: [prop3, prop1, prop6]
  },
  {
    id: "5",
    name: "Residencial Executivo Skyline",
    price: 45000000,
    location: "Itaim Bibi",
    state: "SP",
    suites: 4,
    bathrooms: 6,
    area: 14200,
    parking: 8,
    type: "Penthouse",
    status: "For Sale",
    image: prop4,
    isExclusive: true,
    isVerified: true,
    images: [prop4, prop5, prop6]
  },
  {
    id: "6",
    name: "Villa Esmeralda",
    price: 12500000,
    location: "Trancoso",
    state: "BA",
    suites: 5,
    bathrooms: 7,
    area: 850,
    parking: 4,
    type: "House",
    status: "For Sale",
    image: prop5,
    isVerified: true,
    images: [prop5, prop2, prop4]
  },
  {
    id: "7",
    name: "Mansão Alto de Pinheiros",
    price: 32000000,
    location: "Alto de Pinheiros",
    state: "SP",
    suites: 5,
    bathrooms: 8,
    area: 1100,
    parking: 6,
    type: "House",
    status: "For Sale",
    image: prop6,
    isVerified: true,
    isExclusive: true,
    images: [prop6, prop1, prop3]
  },
  {
    id: "8",
    name: "Casa das Dunas",
    price: 18000000,
    location: "Praia do Forte",
    state: "BA",
    suites: 6,
    bathrooms: 8,
    area: 950,
    parking: 4,
    type: "House",
    status: "For Sale",
    image: prop2,
    isVerified: true,
    images: [prop2, prop5, prop4]
  },
  {
    id: "9",
    name: "Penthouse Diamond",
    price: 22000000,
    location: "Ipanema",
    state: "SP",
    suites: 4,
    bathrooms: 5,
    area: 520,
    parking: 5,
    type: "Penthouse",
    status: "For Sale",
    image: prop3,
    isVerified: true,
    isPinnacle: true,
    images: [prop3, propHero, prop1]
  }
];

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
