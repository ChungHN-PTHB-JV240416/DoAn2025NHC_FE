import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, theme, Button, ConfigProvider, Avatar, Dropdown, Typography, Tooltip } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  ClockCircleOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
  TagOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  MessageOutlined // <--- Import icon tin nhắn
} from '@ant-design/icons';
import { toggleCollapsed, toggleDarkMode } from '../redux/reducers/LayoutSlice';
import { logoutUser } from '../redux/reducers/AuthSlice';
import { toast } from 'react-toastify';
import UserAccountModal from '../pages/users/UserAccountModal';

const { Header, Content, Footer, Sider } = Layout;

// --- CẤU HÌNH MENU ---
const items = [
  { key: 'dashboard', icon: <ClockCircleOutlined />, label: 'Thống kê tổng quan' },
  { key: 'user', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'order', icon: <ShoppingOutlined />, label: 'Quản lý đơn hàng' },
  { type: 'divider' },
  { key: 'product', icon: <AppstoreOutlined />, label: 'Quản lý sản phẩm' },
  { key: 'category', icon: <AppstoreOutlined />, label: 'Quản lý danh mục' },
  { key: 'brand', icon: <TagOutlined />, label: 'Quản lý thương hiệu' },
  // --- MỤC QUẢN LÝ BÌNH LUẬN ---
  { key: 'comment/admin', icon: <MessageOutlined />, label: 'Quản lý bình luận' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { collapsed, isDarkMode } = useSelector((state) => state.layout);
  const { user } = useSelector((state) => state.auth); 
  const { userAccount } = useSelector((state) => state.accountUser);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    // Navigate đến /admin/ + key (VD: /admin/comment/admin)
    navigate(`/admin/${e.key}`);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
      toast.success('Đăng xuất thành công!');
    } catch (error) {
      toast.error('Đăng xuất thất bại!');
    }
  };

  // Logic active menu
  // Nếu path là /admin/comment/admin -> key là 'comment/admin'
  const selectedKey = location.pathname.replace('/admin/', '') || 'dashboard';
  
  const displayAvatar = userAccount?.avatar || user?.avatar;
  const displayName = userAccount?.fullname || user?.username || 'Admin';

  const userMenuProps = {
    items: [
      { 
        key: 'profile', 
        label: 'Hồ sơ cá nhân', 
        icon: <UserOutlined />,
        onClick: () => toast.info('Tính năng đang phát triển') 
      },
      { 
        key: 'settings', 
        label: 'Cài đặt hệ thống', 
        icon: <SettingOutlined />,
        onClick: () => toast.info('Tính năng đang phát triển') 
      },
      { type: 'divider' },
      { 
        key: 'logout', 
        label: 'Đăng xuất', 
        icon: <LogoutOutlined />, 
        danger: true, 
        onClick: handleLogout 
      },
    ]
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#722ed1',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: { siderBg: '#001529' },
          Menu: { darkItemBg: '#001529' }
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          }}
        >
          <div style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.1)',
            margin: 16,
            borderRadius: 6
          }}>
             <img src="/image/anhthuonghieuA.jpg" alt="Logo" style={{ height: 32, borderRadius: 4, marginRight: collapsed ? 0 : 10 }} />
             {!collapsed && (
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    ADMIN PANEL
                </span>
             )}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]} 
            items={items}
            onClick={handleMenuClick}
          />
        </Sider>

        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s ease' }}>
          <Header
            style={{
              padding: '0 24px',
              background: colorBgContainer,
              position: 'sticky',
              top: 0,
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
              height: 64,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => dispatch(toggleCollapsed())}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                <Button
                  shape="circle"
                  icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
                  onClick={() => dispatch(toggleDarkMode())}
                  style={{ border: 'none' }}
                />
              </Tooltip>

              <Tooltip title="Thông báo">
                <Button shape="circle" icon={<BellOutlined />} style={{ border: 'none' }} />
              </Tooltip>

              <Dropdown menu={userMenuProps} placement="bottomRight" arrow>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: 20,
                  transition: 'background 0.3s',
                }}
                className="hover:bg-gray-100"
                >
                  <Avatar 
                    src={displayAvatar} 
                    style={{ backgroundColor: '#722ed1' }} 
                    icon={<UserOutlined />}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>
                    {displayName}
                  </span>
                </div>
              </Dropdown>
            </div>
          </Header>

          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div
              style={{
                padding: 24,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                minHeight: '80vh',
              }}
            >
              <Outlet context={{ isDarkMode }} />
            </div>
          </Content>

          <Footer style={{ textAlign: 'center', padding: '20px' }}>
            APHONE Admin System ©{new Date().getFullYear()} Created by You
          </Footer>
        </Layout>
      </Layout>

      <UserAccountModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        userId={user?.userId} 
        onLogout={handleLogout}
      />
    </ConfigProvider>
  );
};

export default AdminLayout;