import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BASE_URL } from '../api/index'; // Dùng API công khai
import '../styles/BrandsPage.scss';

// KHÔNG IMPORT HEADER/FOOTER VÌ ĐÃ CÓ TRONG LAYOUT

const BrandsPage = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Logic tải dữ liệu không cần đăng nhập
    const fetchBrands = async () => {
      try {
        const response = await BASE_URL.get('/brands');
        // Xử lý dữ liệu trả về (hỗ trợ cả dạng phân trang .content và mảng thường)
        setBrands(response.data.content || response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi tải thương hiệu:', err);
        setError('Không thể tải danh sách thương hiệu.');
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (brandId) => {
    // Điều hướng đến trang chi tiết sản phẩm của thương hiệu đó
    // Lưu ý: Đường dẫn này phải khớp với App.js (đã sửa ở bước trước thành /brands/:brandId cho public)
    navigate(`/brands/${brandId}`); 
  };

  if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center text-danger py-5">{error}</div>;

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: '80vh' }}>
      <Container className="brands-page flex-grow-1 py-5">
        <h1 className="text-center mb-5 text-uppercase fw-bold text-primary">Danh sách đối tác</h1>
        <Row>
          {brands.map((brand) => (
            <Col md={4} sm={6} xs={12} key={brand.brandId} className="mb-4">
              <Card
                onClick={() => handleBrandClick(brand.brandId)}
                className="h-100 shadow-sm border-0 brand-card-hover"
                style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#fff' }}>
                    <Card.Img 
                        variant="top" 
                        src={brand.image} 
                        alt={brand.brandName} 
                        style={{ maxHeight: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} 
                        onError={(e) => e.target.src='https://via.placeholder.com/150?text=Brand'}
                    />
                </div>
                <Card.Body className="bg-white border-top">
                  <Card.Title className="text-center fw-bold text-dark">{brand.brandName}</Card.Title>
                  <Card.Text className="text-muted text-center small text-truncate-2">
                      {brand.description || 'Sản phẩm chính hãng chất lượng cao'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default BrandsPage;