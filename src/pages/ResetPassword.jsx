import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../redux/reducers/GmailSlice';
import { Form, Input, Button, Typography, ConfigProvider } from 'antd';
import { KeyOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.gmail);

  const handleSubmit = async (values) => {
    const result = await dispatch(resetPassword({ token: values.token, newPassword: values.newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Lỗi đặt lại mật khẩu');
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1a73e8' } }}>
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundImage: 'url(url(https://thumua24h.vn/wp-content/uploads/2018/11/banner-thu-mua-dien-thoai-1-1400x700.jpg)',
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
            width: 400,
            padding: '40px 30px',
            background: '#fff', // Nền trắng thuần
            borderRadius: 16,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
             <Title level={3} style={{ color: '#1a73e8', margin: 0 }}>Đặt lại mật khẩu</Title>
             <Text type="secondary">Nhập mã xác nhận từ email và mật khẩu mới</Text>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
            <Form.Item name="token" rules={[{ required: true, message: 'Nhập mã xác nhận!' }]}>
              <Input prefix={<KeyOutlined />} placeholder="Mã xác nhận (Token)" />
            </Form.Item>

            <Form.Item name="newPassword" rules={[{ required: true, min: 6, message: 'Ít nhất 6 ký tự!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading} style={{ height: 45, fontWeight: 600 }}>
                Xác nhận
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Link to="/login" style={{ color: '#1a73e8', fontWeight: 'bold' }}>Quay lại đăng nhập</Link>
            </div>
          </Form>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ResetPassword;