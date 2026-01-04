import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import FooterUser from '../pages/users/FooterUser';

const DefaultLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* [FIX]: Luôn hiển thị Header khách ở layout này. 
                Nếu User đã đăng nhập, họ vẫn thấy Header này nhưng bấm vào Icon User sẽ về Dashboard. */}
            <Header />
            
            {/* Đẩy nội dung xuống 80px để không bị Header (Fixed) che mất */}
            <div style={{ flex: 1, marginTop: '80px', backgroundColor: '#f8f9fa' }}>
                <Outlet />
            </div>

            <FooterUser />
        </div>
    );
};

export default DefaultLayout;