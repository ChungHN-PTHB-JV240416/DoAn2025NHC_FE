import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import HeaderUser from '../pages/users/HeaderUser';
import FooterUser from '../pages/users/FooterUser';

const DefaultLayout = () => {
    // Kiểm tra trạng thái đăng nhập để chọn Header phù hợp
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* 1. Chọn Header: Nếu đã login thì hiện HeaderUser, chưa thì Header khách */}
            {isAuthenticated ? <HeaderUser /> : <Header />}
            
            {/* 2. Đẩy nội dung xuống 80px để không bị Header (Fixed) che mất */}
            <div style={{ flex: 1, marginTop: '80px', backgroundColor: '#f8f9fa' }}>
                <Outlet />
            </div>

            <FooterUser />
        </div>
    );
};

export default DefaultLayout;