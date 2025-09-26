import React from 'react';
import { Carousel, Button } from 'react-bootstrap';
import '../styles/Banner.scss'; // Thêm file CSS cho Banner

const Banner = () => {
  const banners = [
    {
      id: 1,
      title: "Điện thoại chính hãng - Phong cách hiện đại",
      description: "Khám phá bộ sưu tập điện thoại mới nhất 2025",
      image: "/image/anhdienthoai1.png",
      link: "/products/collection1",
    },
    {
      id: 2,
      title: "Ưu đãi lên đến 60%",
      description: "50% Dành cho khách hàng đầu tiên và lên đến 60% cho khách hàng thân thiết",
      image: "/image/anhdienthoai2.jpg",
      link: "/products/sale",
    },
    {
      id: 3,
      title: "Bộ sưu tập mới 2025",
      description: "Thời đại mới, đẳng cấp của sự tinh tế",
      image: "/image/anhdienthoai3.jpg",
      link: "/products/new-collection",
    },
    {
      id: 4,
      title: "Khuyến mãi đặc biệt",
      description: "Giảm giá sock cho điện thoại cao cấp",
      image: "/image/anhdienthoai4.png",
      link: "/products/special-offer",
    },
  ];

  return (
    <Carousel fade interval={3000} pause="hover" className="banner-carousel">
      {banners.map((banner) => (
        <Carousel.Item key={banner.id}>
          <div className="banner-overlay" />
          <img
            className="d-block w-100 banner-image"
            src={banner.image}
            alt={banner.title}
            onError={(e) => (e.target.src = 'https://picsum.photos/1200/400?random=1')} // Thu nhỏ ảnh placeholder
          />
          <Carousel.Caption className="banner-caption">
            <h3>{banner.title}</h3>
            <p>{banner.description}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default Banner;