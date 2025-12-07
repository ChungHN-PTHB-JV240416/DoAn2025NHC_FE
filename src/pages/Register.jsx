import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, Input, Button, Typography, ConfigProvider, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, HomeOutlined, SafetyOutlined } from '@ant-design/icons';
import { BASE_URL } from '../api/index';

const { Title, Text } = Typography;

function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await BASE_URL.post('/auth/sign-up', values);
      toast.success('Đăng ký thành công!', { position: 'top-right' });
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Đăng ký thất bại!';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1a73e8' } }}>
      <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // Sử dụng ảnh nền banner giống Login
          backgroundImage: 'url(https://thumua24h.vn/wp-content/uploads/2018/11/banner-thu-mua-dien-thoai-1-1400x700.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
      }}>
        {/* Lớp phủ đen mờ */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.4)',
        }} />

        {/* Box Form Trắng */}
        <div style={{
            position: 'relative',
            zIndex: 1,
            background: '#fff',
            padding: '40px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '100%',
            maxWidth: '500px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
             <Title level={3} style={{ margin: 0, color: '#1a73e8' }}>Tạo tài khoản mới</Title>
             <Text type="secondary">Tham gia cộng đồng APHONE ngay hôm nay</Text>
          </div>

          <Form form={form} onFinish={onFinish} layout="vertical" size="large" autoComplete="off">
            <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập username!' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}>
              <Input prefix={<UserOutlined className="text-muted" />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input prefix={<MailOutlined className="text-muted" />} placeholder="Email" />
            </Form.Item>

            <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
              <Input prefix={<UserOutlined className="text-muted" />} placeholder="Họ và tên" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }]}>
              <Input.Password prefix={<LockOutlined className="text-muted" />} placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<SafetyOutlined className="text-muted" />} placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Form.Item name="phoneNumber" rules={[{ required: true, pattern: /^\d{10,11}$/, message: 'SĐT không hợp lệ!' }]}>
              <Input prefix={<PhoneOutlined className="text-muted" />} placeholder="Số điện thoại" />
            </Form.Item>

            <Form.Item name="address" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}>
              <Input prefix={<HomeOutlined className="text-muted" />} placeholder="Địa chỉ" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45, fontSize: 16, fontWeight: 600, marginTop: 10 }}>
                Đăng Ký
              </Button>
            </Form.Item>

            <Divider style={{ margin: '20px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Text>Đã có tài khoản? <Link to="/login" style={{ color: '#1a73e8', fontWeight: 'bold' }}>Đăng nhập ngay</Link></Text>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default Register;