import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, theme, Button, ConfigProvider, Avatar, Dropdown, Space, Typography, Tooltip } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  ClockCircleOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
  TagOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { toggleCollapsed, toggleDarkMode } from '../redux/reducers/LayoutSlice';
import { clearCurrentUser } from '../redux/reducers/UserSlice';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { logout } from '../services/authService';

const { Header, Content, Footer, Sider } = Layout;
const { Text } = Typography;

const items = [
  { key: 'dashboard', icon: <ClockCircleOutlined />, label: 'Thống kê tổng quan' },
  { key: 'user', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'order', icon: <ShoppingCartOutlined />, label: 'Quản lý đơn hàng' },
  { type: 'divider' },
  { key: 'product', icon: <AppstoreOutlined />, label: 'Quản lý sản phẩm' },
  { key: 'category', icon: <AppstoreOutlined />, label: 'Quản lý danh mục' },
  { key: 'brand', icon: <TagOutlined />, label: 'Quản lý thương hiệu' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { collapsed, isDarkMode } = useSelector((state) => state.layout);
  const { currentUser } = useSelector((state) => state.users);

  // Ant Design Token
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

  const handleMenuClick = (e) => {
    navigate(`/admin/${e.key}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearCurrentUser());
      navigate('/login');
      toast.success('Đăng xuất thành công!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Lỗi trong quá trình đăng xuất:', error);
      Cookies.remove('token');
      dispatch(clearCurrentUser());
      navigate('/login');
      toast.error('Đã xảy ra lỗi khi đăng xuất!', { position: 'top-right', autoClose: 3000 });
    }
  };

  const selectedKey = location.pathname.split('/admin/')[1] || 'dashboard';

  // Menu dropdown cho User
  const userMenuProps = {
    items: [
     
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
          colorPrimary: '#722ed1', // Đổi sang màu Tím (Purple) hiện đại
          borderRadius: 12, // Bo góc lớn hơn
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Layout: {
            siderBg: '#111827', // Sidebar màu tối đậm (Dark slate)
            triggerBg: '#1f2937',
          },
          Menu: {
            darkItemBg: '#111827',
            darkItemSelectedBg: '#722ed1', // Màu tím khi active
            itemHeight: 45,
            itemMarginInline: 10, // Thụt lề menu item
            itemBorderRadius: 8,
          }
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
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
          {/* LOGO AREA */}
          <div style={{ 
            height: 70, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.05)',
            margin: '0 10px 10px 10px',
            borderRadius: '0 0 12px 12px'
          }}>
            <div style={{ 
              color: '#fff', 
              fontSize: collapsed ? 20 : 22, 
              fontWeight: 'bold', 
              letterSpacing: 1,
              background: 'linear-gradient(45deg, #722ed1, #eb2f96)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {collapsed ? 'PS' : 'PHONE STORE'}
            </div>
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </Sider>

        {/* MAIN LAYOUT */}
        <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s ease' }}>
          
          {/* HEADER */}
          <Header
            style={{
              padding: '0 24px',
              background: isDarkMode ? '#141414' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)', // Hiệu ứng kính mờ
              position: 'sticky',
              top: 0,
              zIndex: 99,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              height: 70,
            }}
          >
            {/* Left: Toggle Button & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => dispatch(toggleCollapsed())}
                style={{ fontSize: '16px', width: 40, height: 40 }}
              />
              <Text strong style={{ fontSize: 18, color: isDarkMode ? '#fff' : '#1f2937' }}>
                Dashboard Quản Trị
              </Text>
            </div>

            {/* Right: Actions & User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              
              {/* Theme Toggle */}
              <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                <Button
                  shape="circle"
                  icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
                  onClick={() => dispatch(toggleDarkMode())}
                  style={{ border: 'none', background: 'transparent' }}
                />
              </Tooltip>

              {/* Notification */}
              <Tooltip title="Thông báo">
                <Button 
                  shape="circle" 
                  icon={<BellOutlined />} 
                  style={{ border: 'none', background: 'transparent' }} 
                />
              </Tooltip>

              {/* User Dropdown */}
              <Dropdown menu={userMenuProps} placement="bottomRight" arrow>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: 30,
                  background: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                  transition: 'all 0.3s'
                }}>
                  <Avatar 
                    style={{ backgroundColor: '#722ed1', verticalAlign: 'middle' }} 
                    size="small"
                  >
                    {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'A'}
                  </Avatar>
                  {!isDarkMode && (
                    <span style={{ fontWeight: 500, fontSize: 14, color: '#374151' }}>
                      {currentUser?.username || 'Admin'}
                    </span>
                  )}
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* CONTENT */}
          <Content
            style={{
              margin: '24px 24px 0',
              overflow: 'initial',
              minHeight: 280,
            }}
          >
            <div
              style={{
                padding: 32,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)', // Đổ bóng mềm cho nội dung
                minHeight: '80vh',
                position: 'relative'
              }}
            >
              <Outlet context={{ isDarkMode, toggleTheme: () => dispatch(toggleDarkMode()) }} />
            </div>
          </Content>

          {/* FOOTER */}
          <Footer style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
            Phone Store System ©{new Date().getFullYear()} Created with ❤️ by Nguyen Huu Chung
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;