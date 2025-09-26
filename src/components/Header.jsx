import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../services/authService';
import '../styles/Header.scss';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    if (!isAuthenticated) {
      toast.warning('Bạn chưa đăng nhập!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }

    try {
      await logout();
      toast.success('Đăng xuất thành công!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
    } catch (error) {
      toast.error('Đăng xuất thất bại!', { position: 'top-right', autoClose: 3000 });
      console.log(error);
    }
  };

  const handleUserClick = () => {
    if (!isAuthenticated) {
      toast.warning('Đăng xuất!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
    } else {
      handleLogout();
    }
  };

  const handleRestrictedClick = (path) => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng chức năng này!', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <Navbar expand="lg" className="header">
      <Container>
        <Navbar.Brand href="/" className="logo">  
        <img
        src="/image/anhthuonghieuA.jpg" // Đường dẫn đến file trong public/image
        alt="APHONE Logo"
        className="logo-img"
        style={{ height: '40px', marginRight: '10px' }} // Điều chỉnh kích thước và khoảng cách
      />
          <span className="logo-A">A</span>PHONE
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto nav-links">
            <Nav.Link href="/">Về Alone Phone</Nav.Link>
            <Nav.Link onClick={() => handleRestrictedClick('/brands')}>Thương hiệu</Nav.Link>
            <Nav.Link href="/categories/1">MAN PHONE</Nav.Link> 
            <Nav.Link href="/categories/2">GIRL PHONE</Nav.Link> 
            <Nav.Link href="/categories/3">COUPLE</Nav.Link> {/* Tạm thời, có thể thay đổi */}
            <Nav.Link onClick={handleRestrictedClick} href="/user/history">Order history</Nav.Link>
          </Nav>

          <div className="navbar-icons">
            <div className="hotline">
              <FiPhone className="icon" />
              <span>0965804364</span>
            </div>
            <div className="cart">
              <FaShoppingCart className="icon" />
              <span className="cart-count">0</span>
            </div>
            <div className="user">
              <FaUser
                className="icon"
                onClick={handleUserClick}
                style={{ cursor: 'pointer', opacity: isAuthenticated ? 1 : 0.5 }}
                title={isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
              />
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;