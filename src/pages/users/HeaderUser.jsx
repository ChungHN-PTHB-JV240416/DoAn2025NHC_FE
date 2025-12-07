import React, { useEffect, useState, useMemo } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Avatar, Badge } from 'antd'; 
import { UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';

import { logoutUser } from '../../redux/reducers/AuthSlice';
import { fetchCartItems, resetCart } from '../../redux/reducers/CartSlice';
import { resetUserOrders } from '../../redux/reducers/OrderSliceUser';
import { resetUserAccount, fetchUserAccount } from '../../redux/reducers/AccountUserSlice';
import UserAccountModal from '../users/UserAccountModal';

const HeaderUser = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);
    const { userAccount } = useSelector((state) => state.accountUser);
    const { totalItems, loading, hasFetchedCart } = useSelector((state) => state.cart);
    
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.userId && token) {
            if (!hasFetchedCart && !loading) dispatch(fetchCartItems(user.userId));
            dispatch(fetchUserAccount(user.userId));
        }
    }, [dispatch, isAuthenticated, user?.userId, token, hasFetchedCart, loading]);

    // Tính toán URL ảnh
    const avatarUrl = useMemo(() => {
        const rawAvatar = userAccount?.avatar || user?.avatar;
        if (!rawAvatar) return null;
        
        if (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:')) {
            // Fix lỗi mixed content nếu có
            return rawAvatar.replace('http:', 'https:');
        }
        
        const baseUrl = 'http://localhost:8080';
        const path = rawAvatar.startsWith('/') ? rawAvatar.slice(1) : rawAvatar;
        const timestamp = userAccount?.updatedAt ? `?t=${new Date(userAccount.updatedAt).getTime()}` : '';
        
        return `${baseUrl}/${path}${timestamp}`;
    }, [userAccount, user?.avatar]);

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            dispatch(resetCart());
            dispatch(resetUserOrders());
            dispatch(resetUserAccount());
            toast.success('Đăng xuất thành công!');
            navigate('/login');
        } catch { toast.error('Đăng xuất thất bại'); }
    };

    return (
        <>
            {/* Navbar màu đen, full width, sticky top */}
            <Navbar expand="lg" style={{ backgroundColor: '#1a1a1a', padding: '15px 0', borderBottom: '1px solid #333' }} variant="dark" sticky="top">
                <Container>
                    <Navbar.Brand onClick={() => navigate('/user')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '24px', display: 'flex', alignItems: 'center', color: '#fff' }}>
                        <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                             <img src="/image/anhthuonghieuA.jpg" alt="Logo" style={{ width: '90%', borderRadius: 4 }} />
                        </div>
                        <span style={{ color: '#fff' }}>APHONE</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />

                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mx-auto" style={{ gap: '15px' }}>
                            <Nav.Link onClick={() => navigate('/user')} className={location.pathname === '/user' ? 'text-warning fw-bold' : 'text-white'}>TRANG CHỦ</Nav.Link>
                            <Nav.Link onClick={() => navigate('/user/brands')} className="text-white">THƯƠNG HIỆU</Nav.Link>
                            <Nav.Link href="/user/categories/1" className="text-white">PHONE MAIN ZIN</Nav.Link>
                            <Nav.Link href="/user/categories/2" className="text-white">PHONE SÁCH TAY</Nav.Link>
                            <Nav.Link onClick={() => navigate('/user/history')} className="text-white">LỊCH SỬ</Nav.Link>
                        </Nav>

                        <div className="d-flex align-items-center gap-4 mt-3 mt-lg-0">
                            <div className="d-none d-xl-flex text-white align-items-center">
                                <FiPhone className="me-2" /> <span>0965.804.364</span>
                            </div>

                            {/* Cart Icon */}
                            <div onClick={() => navigate('/user/cart')} style={{ cursor: 'pointer', position: 'relative' }}>
                                <Badge count={totalItems} size="small" offset={[0, 0]}>
                                    <Avatar size="large" icon={<ShoppingCartOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                </Badge>
                            </div>

                            {/* User Avatar */}
                            <div onClick={() => setIsModalVisible(true)} style={{ cursor: 'pointer' }}>
                                {isAuthenticated ? (
                                    <Avatar size="large" src={avatarUrl} icon={<UserOutlined />} style={{ border: '2px solid #1890ff', backgroundColor: '#f0f0f0' }} />
                                ) : (
                                    <Avatar size="large" icon={<UserOutlined />} />
                                )}
                            </div>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <UserAccountModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} userId={user?.userId} onLogout={handleLogout} />
        </>
    );
};

export default HeaderUser;