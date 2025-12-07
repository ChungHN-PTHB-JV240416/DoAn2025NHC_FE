import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderUser from '../pages/users/HeaderUser';
import FooterUser from '../pages/users/FooterUser';

const UserLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {/* Header cố định */}
            <HeaderUser />
            
            {/* Nội dung trang (có margin-top để không bị header che nếu header là fixed) */}
            {/* Ở đây header dùng sticky nên không cần margin-top quá lớn, flex: 1 để đẩy footer xuống đáy */}
            <div style={{ flex: 1, paddingBottom: '40px' }}>
                <Outlet />
            </div>

            {/* Footer */}
            <FooterUser />
        </div>
    );
};

export default UserLayout;