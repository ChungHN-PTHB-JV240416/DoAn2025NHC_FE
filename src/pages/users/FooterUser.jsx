import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const FooterUser = () => {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '50px 0 20px', marginTop: 'auto' }}>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-warning mb-3">APHONE</h5>
            <p>Hệ thống bán lẻ điện thoại chính hãng uy tín.</p>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-warning mb-3">Liên hệ</h5>
            <p><FaMapMarkerAlt className="me-2" /> Hà Nội, Việt Nam</p>
            <p><FaPhoneAlt className="me-2" /> 0965.804.364</p>
            <p><FaEnvelope className="me-2" /> support@aphone.vn</p>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-warning mb-3">Mạng xã hội</h5>
            <div className="d-flex gap-3 fs-4">
                <FaFacebook /> <FaInstagram /> <FaYoutube />
            </div>
          </Col>
        </Row>
        <div className="text-center small text-secondary mt-4 border-top pt-3 border-secondary">
          &copy; 2025 APHONE. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default FooterUser;