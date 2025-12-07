import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux'; // Thêm useSelector
import { useNavigate } from 'react-router-dom'; // Thêm useNavigate
import { toast } from 'react-toastify'; // Thêm toast
import '../styles/Footer.scss';

const Footer = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth); // Lấy trạng thái đăng nhập từ Redux

  const handleLinkClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Ngăn hành động mặc định của liên kết
      toast.warning('Vui lòng đăng nhập để truy cập!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
    }
    console.log(path);
    // Nếu đã đăng nhập, cho phép nhấp vào liên kết bình thường
  };

  return (
    <footer className="footer bg-dark text-light py-5 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-primary mb-3">Thông tin liên hệ</h5>
            <p>Địa chỉ: Đường Yên, Xuân Nộn, Đông Anh, Hà Nội</p>
            <p>Hotline: <span className="text-warning fw-bold">0965804364</span></p>
            <p>Email: support@APhone.vn</p>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-primary mb-3">Chính sách</h5>
            <ul className="list-unstyled">
                <li>
                    <a
                        href="/policy/warranty"
                        onClick={(e) => handleLinkClick(e, '/policy/warranty')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Chính sách bảo hành
                    </a>
                </li>
                <li>
                    <a
                        href="/policy/return"
                        onClick={(e) => handleLinkClick(e, '/policy/return')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Chính sách đổi trả
                    </a>
                </li>
                <li>
                    <a
                        href="/policy/delivery"
                        onClick={(e) => handleLinkClick(e, '/policy/delivery')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Chính sách giao hàng
                    </a>
                </li>
            </ul>
          </Col>
          <Col md={4} className="mb-4">
            <h5 className="text-uppercase fw-bold text-primary mb-3">Liên kết nhanh</h5>
            <ul className="list-unstyled">
                <li>
                    <a
                        href="/about"
                        onClick={(e) => handleLinkClick(e, '/about')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Giới thiệu
                    </a>
                </li>
                <li>
                    <a
                        href="/news"
                        onClick={(e) => handleLinkClick(e, '/news')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Tin tức
                    </a>
                </li>
                <li>
                    <a
                        href="/contact"
                        onClick={(e) => handleLinkClick(e, '/contact')}
                        className="text-decoration-none"
                        style={{ color: isAuthenticated ? '#adb5bd' : '#6c757d', pointerEvents: isAuthenticated ? 'auto' : 'none', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => isAuthenticated && (e.target.style.color = '#fff')}
                        onMouseLeave={(e) => isAuthenticated && (e.target.style.color = '#adb5bd')}
                    >
                        Liên hệ
                    </a>
                </li>
            </ul>
          </Col>
        </Row>
        <hr className="bg-light" />
        <p className="text-center mb-0 small">&copy; 2025 APHONE. All Rights Reserved.</p>
      </Container>
    </footer>
  );
};

export default Footer;