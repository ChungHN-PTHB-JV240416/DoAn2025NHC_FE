import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginUser } from '../redux/reducers/AuthSlice';
import { Form, Input, Button, Typography, ConfigProvider, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading, validationErrors } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const result = await dispatch(loginUser({ username: values.username, password: values.password }));
    if (loginUser.fulfilled.match(result)) {
      const roles = result.payload.roles.map((role) => role.roleName || role);
      toast.success('Đăng nhập thành công!', { position: 'top-right', autoClose: 3000 });
      if (roles.includes('ADMIN')) {
        navigate('/admin');
      } else if (roles.includes('USER')) {
        navigate('/user');
      } else {
        navigate('/');
      }
    } else {
      if (result.payload?.code === 400 && result.payload?.message) {
        Object.values(result.payload.message).forEach((error) => {
          toast.error(error, { position: 'top-right', autoClose: 3000 });
        });
      } else if (result.payload?.errors) {
        Object.values(result.payload.errors).forEach((error) => {
          toast.error(error, { position: 'top-right', autoClose: 3000 });
        });
      } else {
        toast.error(result.payload?.message || 'Tài khoản hoặc mật khẩu không đúng', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1a73e8' } }}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // KHÔI PHỤC NỀN CŨ CỦA BẠN
          backgroundImage: 'url(https://thumua24h.vn/wp-content/uploads/2018/11/banner-thu-mua-dien-thoai-1-1400x700.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        {/* Lớp phủ đen mờ để làm nổi form trắng lên */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.4)', // Đậm hơn chút để form trắng nổi bật
          }} 
        />

        {/* Form Container: Giữ nguyên style "box trắng" giống Register */}
        <div
          style={{
            position: 'relative', // Để nổi lên trên lớp phủ
            zIndex: 1,
            background: '#fff',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Title level={3} style={{ margin: 0, color: '#1a73e8' }}>
              Đăng nhập
            </Title>
            <Text type="secondary">Chào mừng bạn quay trở lại với APHONE</Text>
          </div>

          <Form 
            form={form} 
            onFinish={handleSubmit} 
            layout="vertical" 
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              validateStatus={validationErrors.username ? 'error' : ''}
              help={validationErrors.username}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-muted" />} 
                placeholder="Tên đăng nhập" 
                disabled={loading} 
              />
            </Form.Item>

            <Form.Item
              name="password"
              validateStatus={validationErrors.password ? 'error' : ''}
              help={validationErrors.password}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              style={{ marginBottom: 10 }}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-muted" />} 
                placeholder="Mật khẩu" 
                disabled={loading} 
              />
            </Form.Item>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link
                to="/forgot-password"
                style={{ color: '#1a73e8', fontSize: 14 }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ height: 45, fontSize: 16, fontWeight: 600 }}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <Divider style={{ margin: '20px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Text>
                Bạn chưa có tài khoản?{' '}
                <Link 
                  to="/register" 
                  style={{ color: '#1a73e8', fontWeight: 'bold' }}
                >
                  Đăng ký ngay
                </Link>
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;