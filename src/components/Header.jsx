import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();

  // Hàm chặn truy cập cho các mục cần bảo mật (Lịch sử, Giỏ hàng)
  const handleRestrictedClick = () => {
    toast.info('Vui lòng đăng nhập để sử dụng tính năng này!', { position: 'top-right', autoClose: 3000 });
    navigate('/login');
  };

  return (
    <>
      <style>
        {`
            .floating-navbar {
                padding: 15px 0 !important;
                background: transparent !important; 
                transition: none !important;
                z-index: 1030;
            }
            .custom-container {
                background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%) !important;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 50px !important; 
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
                padding: 8px 30px !important;
                width: 100%;
            }
            .nav-link-modern {
                color: rgba(255, 255, 255, 0.85) !important;
                font-weight: 600;
                margin: 0 15px;
                position: relative;
                font-size: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                cursor: pointer;
                text-decoration: none;
            }
            .nav-link-modern:hover {
                color: #ffffff !important;
                text-shadow: 0 0 10px rgba(255,255,255,0.6);
            }
            .brand-text {
                font-weight: 800;
                font-size: 24px;
                background: linear-gradient(to right, #fbbf24, #f59e0b); 
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: 1px;
                margin-left: 12px;
            }
            .action-btn {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.1);
                margin-left: 12px;
                cursor: pointer;
                border: 1px solid rgba(255,255,255,0.1);
                overflow: hidden; 
                transition: all 0.3s ease;
            }
            .action-btn:hover {
                background: rgba(255,255,255,0.25);
                border-color: rgba(255,255,255,0.5);
            }
            .cart-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                font-size: 10px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #1e293b;
                font-weight: bold;
            }
        `}
      </style>

      <Navbar expand="lg" fixed="top" className="floating-navbar">
        <Container className="custom-container">
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <div style={{ width: 38, height: 38, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3 }}>
              <img src="/image/anhthuonghieuA.jpg" alt="Logo" style={{ width: '100%', borderRadius: 6 }} />
            </div>
            <span className="brand-text">APHONE</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ filter: 'invert(1)' }} />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="/" className="nav-link-modern">Trang chủ</Nav.Link>
              
              {/* Cho phép khách truy cập */}
              <Nav.Link href="/brands" className="nav-link-modern">Thương hiệu</Nav.Link>
              <Nav.Link href="/categories/1" className="nav-link-modern">Phone Main Zin</Nav.Link>
              <Nav.Link href="/categories/2" className="nav-link-modern">Phone Sách Tay</Nav.Link>
              
              {/* Bắt buộc đăng nhập */}
              <Nav.Link onClick={handleRestrictedClick} className="nav-link-modern">Lịch sử</Nav.Link>
            </Nav>

            <div className="d-flex align-items-center">
              <div className="d-none d-xl-flex align-items-center me-4" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                <FiPhone style={{ marginRight: 8 }} />
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>0965.804.364</span>
              </div>

              {/* Cart Button (Giả - Bắt login) */}
              <div className="action-btn" onClick={handleRestrictedClick}>
                <div style={{ position: 'relative' }}>
                  <FaShoppingCart color="#fff" size={18} />
                  <span className="cart-badge">0</span>
                </div>
              </div>

              {/* User Button (Chuyển sang login) */}
              <div className="action-btn" onClick={() => navigate('/login')}>
                <FaUser color="#fff" size={18} />
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;