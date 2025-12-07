import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const BrandList = ({ brands }) => {
  return (
    <section className="brand-section py-5 bg-light">
      <Container>
        <h2 className="text-center mb-4 text-uppercase fw-bold" style={{ color: '#333' }}>Thương hiệu nổi bật</h2>
        <Row className="justify-content-center">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <Col xs={6} sm={4} md={2} key={brand.brandId} className="mb-4">
                <a href={`/brands/${brand.brandId}`} className="text-decoration-none">
                  <div className="bg-white p-3 rounded shadow-sm h-100 d-flex align-items-center justify-content-center" 
                       style={{ transition: 'transform 0.3s ease', cursor: 'pointer' }}
                       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <img
                      src={brand.logo || 'https://picsum.photos/150/80?random=4'}
                      alt={brand.brandName}
                      className="brand-logo img-fluid"
                      onError={(e) => (e.target.src = 'https://picsum.photos/150/80?random=4')}
                      style={{ maxHeight: '80px', width: 'auto', objectFit: 'contain' }} // Fix ảnh logo
                    />
                  </div>
                </a>
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center text-muted">Không có thương hiệu nào để hiển thị.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default BrandList;