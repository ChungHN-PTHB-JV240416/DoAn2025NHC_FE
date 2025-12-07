import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BASE_URL } from '../api/index';
import '../styles/CategoryProductsPage.scss';
import Banner from './Banner';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const blogPosts = [
    {
      id: 1,
      title: "Chính sách bảo hành điện thoại 5 năm cả lỗi người dùng",
      date: "30/11/2023",
      image: "/image/baohanhdienthoai.jpg", // Sửa đường dẫn
      description: "Vui lòng mượn đem đến cho Quý khách hàng sự AN TÂM tuyệt đối khi mua điện thoại, đội ngũ APHONE đã xây...",
    },
    {
      id: 2,
      title: "8/3: Mua điện thoại nữ - Tặng món quà thanh xuân!",
      date: "01/21/2023",
      image: "/image/quaphunu.jpg", // Sửa đường dẫn
      description: "8/3 này, chúc em đi ra đi vào sức khỏe dồi dào",
    },
    {
      id: 3,
      title: "Thông báo: APHONE Hà Đông chuyển địa điểm mới!",
      date: "04/02/2025",
      image: "/image/chuyendiadiem.jpg", // Sửa đường dẫn
      description: "Nhằm mang đến một không gian khách hàng trang, hiện đại hơn giúp anh em có những trải nghiệm tuyệt vời...",
    },
    {
      id: 4,
      title: "APHONE thông báo lịch nghỉ Tết At Tý 2025!",
      date: "30/11/2023",
      image: "/image/lichnghitet.jpg", // Sửa đường dẫn
      description: "Nhân dịp Tết Nguyên Đán At Tý 2025, APHONE trân trọng thông báo đến Quý khách hàng lịch nghỉ Tết của...",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await BASE_URL.get(`/products/categories/${categoryId}`);
        setProducts(response.data.content);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải danh sách sản phẩm.');
        setLoading(false);
        console.error('Lỗi khi lấy sản phẩm:', err.response?.data || err.message);
      }
    };

    fetchProducts();
  }, [categoryId]);

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <Container className="category-products-page py-4">
      {/* Banner quảng cáo */}
      <Banner />

      <h1 className="text-center my-5 text-uppercase fw-bold text-primary">
        {categoryId === '1' ? 'MAN PHONE' : categoryId === '2' ? 'GIRL PHONE' : 'COUPLE'}
      </h1>
      <Row>
        {products.map((product) => (
          <Col md={4} sm={6} key={product.productId} className="mb-4">
            <Card className="product-card h-100 shadow-sm border-0">
              <div style={{ padding: '20px' }}>
                  <Card.Img 
                    variant="top" 
                    src={product.image} 
                    alt={product.productName} 
                    style={{ height: '250px', objectFit: 'contain' }} // Fix ảnh sản phẩm
                  />
              </div>
              <Card.Body className="d-flex flex-column bg-white">
                <Card.Title className="text-center fw-bold">{product.productName}</Card.Title>
                <Card.Text className="text-muted small text-center" style={{ minHeight: '40px' }}>{product.description}</Card.Text>
                <Card.Text className="text-danger fw-bold fs-5 text-center mt-auto">
                    Giá: {product.unitPrice.toLocaleString('vi-VN')} VNĐ
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Phần bài viết (blog posts) */}
      <div className="blog-section mt-5 pt-5 border-top">
        <h2 className="text-center mb-4">Kiến thức điện thoại</h2>
        <Row>
          {blogPosts.map((post) => (
            <Col md={3} sm={6} key={post.id} className="mb-4">
              <Card className="blog-card h-100 shadow-sm border-0">
                <Card.Img 
                    variant="top" 
                    src={post.image} 
                    alt={post.title} 
                    style={{ height: '180px', objectFit: 'cover' }} // Blog dùng cover
                />
                <Card.Body>
                  <Card.Title className="fs-6 fw-bold">{post.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted small">{post.date}</Card.Subtitle>
                  <Card.Text className="small">{post.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default CategoryProductsPage;