import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchCartItems, updateCartItem, removeCartItem, clearCart, checkoutCart, checkoutCOD, checkoutSuccess, clearCheckoutRedirect } from '../../redux/reducers/CartSlice';
import { Card, Button, Form, Input, Row, Col, Typography, Space, Divider, Spin, Modal, Radio, Image } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy dữ liệu từ Redux
    const { isAuthenticated, user, token } = useSelector((state) => state.auth);
    const { items, loading, error, totalItems, checkoutRedirectUrl, orderId, hasFetchedCart } = useSelector((state) => state.cart);
    
    const [form] = Form.useForm();
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('paypal');

    // 1. Kiểm tra đăng nhập và lấy giỏ hàng
    useEffect(() => {
        if (isAuthenticated && user?.userId) {
            // Luôn gọi lấy giỏ hàng mới nhất khi vào trang
            dispatch(fetchCartItems(user.userId));
        } else if (!isAuthenticated) {
            toast.warning('Vui lòng đăng nhập để xem giỏ hàng!', { position: 'top-right', autoClose: 3000 });
            navigate('/login');
        }
    }, [isAuthenticated, user?.userId, dispatch, navigate]);

    // 2. Xử lý Redirect từ PayPal (nếu có)
    useEffect(() => {
        if (checkoutRedirectUrl) {
            window.location.href = checkoutRedirectUrl;
            dispatch(clearCheckoutRedirect());
        }
    }, [checkoutRedirectUrl, dispatch]);

    // 3. Xử lý khi đặt hàng thành công (COD)
    useEffect(() => {
        if (orderId) {
            const totalPrice = calculateTotalPrice();
            setOrderInfo({ orderId, totalPrice });
            toast.success('Đặt hàng COD thành công!', { position: 'top-right', autoClose: 3000 });
            dispatch(clearCheckoutRedirect());
            dispatch(fetchCartItems(user.userId));
        }
    }, [orderId, dispatch, user?.userId]);

    // 4. Xử lý kết quả trả về từ PayPal (Success/Cancel)
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const paymentId = searchParams.get('paymentId');
        const payerId = searchParams.get('PayerID');
        const userIdParam = searchParams.get('userId');
        const receiveAddress = searchParams.get('receiveAddress');
        const receiveName = searchParams.get('receiveName');
        const receivePhone = searchParams.get('receivePhone');
        const note = searchParams.get('note');

        if (location.pathname.includes('/success') && paymentId && payerId && userIdParam) {
            dispatch(checkoutSuccess({ paymentId, payerId, userId: userIdParam, receiveAddress, receiveName, receivePhone, note }))
                .unwrap()
                .then((data) => {
                    const newOrderId = data.message.split('Mã đơn hàng: ')[1] || 'N/A';
                    const totalPrice = calculateTotalPrice(); // Lưu ý: giá trị này có thể không chính xác nếu items đã bị clear, nên lấy từ server trả về nếu có
                    setOrderInfo({ orderId: newOrderId, totalPrice: 0 }); // Set tạm 0 hoặc lấy từ response
                    toast.success('Thanh toán PayPal thành công!', { position: 'top-right', autoClose: 3000 });
                    dispatch(clearCart(user.userId));
                })
                .catch((error) => {
                    toast.error(error || 'Xác nhận thanh toán thất bại!', { position: 'top-right', autoClose: 3000 });
                    navigate('/user/cart');
                });
        } else if (location.pathname.includes('/cancel')) {
            // Logic hủy PayPal
            toast.info('Thanh toán đã bị hủy!', { position: 'top-right', autoClose: 3000 });
            dispatch(clearCheckoutRedirect());
            navigate('/user/cart');
        }
    }, [location.pathname, location.search, dispatch, navigate, user?.userId, token]);

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

    const handleQuantityChange = (cartItemId, quantity) => {
        if (quantity < 1) return;
        dispatch(updateCartItem({ cartItemId, quantity }))
            .unwrap()
            .then(() => toast.success('Cập nhật số lượng thành công!'))
            .catch((err) => toast.error(err || 'Lỗi cập nhật'));
    };

    const handleRemoveItem = (cartItemId) => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        dispatch(removeCartItem({ userId: user.userId, cartItemId }))
            .unwrap()
            .then(() => toast.success('Đã xóa sản phẩm!'))
            .catch((err) => toast.error(err || 'Lỗi xóa sản phẩm'));
    };

    const handleClearCart = () => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng không?')) {
            dispatch(clearCart(user.userId))
                .unwrap()
                .then(() => toast.success('Đã xóa toàn bộ giỏ hàng!'))
                .catch((err) => toast.error(err || 'Lỗi xóa giỏ hàng'));
        }
    };

    const redirectToLogin = () => {
        toast.warning('Vui lòng đăng nhập!');
        navigate('/login');
    };

    const handleCheckout = async () => {
        if (!isAuthenticated || !user?.userId) return redirectToLogin();
        if (items.length === 0) {
            toast.error('Giỏ hàng trống!');
            return;
        }

        try {
            const values = await form.validateFields();
            setPaymentLoading(true);
            const checkoutData = {
                userId: user.userId,
                receiveAddress: values.receiveAddress,
                receiveName: values.receiveName,
                receivePhone: values.receivePhone,
                note: values.note || 'Không có ghi chú',
            };
            const totalPrice = calculateTotalPrice();

            if (paymentMethod === 'paypal') {
                dispatch(checkoutCart(checkoutData))
                    .unwrap()
                    .then((response) => {
                        if (response.redirectUrl) window.location.href = response.redirectUrl;
                    })
                    .catch((err) => toast.error(err || 'Lỗi thanh toán PayPal'))
                    .finally(() => setPaymentLoading(false));
            } else if (paymentMethod === 'cod') {
                dispatch(checkoutCOD(checkoutData))
                    .unwrap()
                    .then((response) => {
                        setOrderInfo({ orderId: response.orderId, totalPrice });
                        dispatch(fetchCartItems(user.userId));
                    })
                    .catch((err) => toast.error(err || 'Lỗi thanh toán COD'))
                    .finally(() => setPaymentLoading(false));
            }
        } catch (error) {
            setPaymentLoading(false);
            toast.error('Vui lòng kiểm tra lại thông tin giao hàng!');
        }
    };

    const calculateTotalPrice = () => {
        return items.reduce((total, item) => total + (item.unitPrice || 0) * (item.orderQuantity || 0), 0);
    };

    const calculateTotalPriceInUSD = () => {
        const totalVND = calculateTotalPrice();
        const exchangeRate = 1 / 24000;
        return (totalVND * exchangeRate).toFixed(2);
    };

    if (loading || paymentLoading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" tip="Đang xử lý..." />
            </div>
        );
    }

    if (error) return <div style={{ textAlign: 'center', color: 'red', padding: '40px' }}><h3>{error}</h3></div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
            {/* Tiêu đề trang */}
            <Title level={2} style={{ marginBottom: '30px', color: '#333', borderLeft: '5px solid #1890ff', paddingLeft: '15px' }}>
                <ShoppingCartOutlined /> Giỏ hàng của bạn
            </Title>

            <Row gutter={32}>
                {/* Cột trái: Danh sách sản phẩm */}
                <Col xs={24} lg={16}>
                    <Card className="shadow-sm" style={{ borderRadius: 12, marginBottom: 20 }}>
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/9bdd8040b334d31946f49e36beaf32db.png" alt="Empty Cart" style={{ width: 100, marginBottom: 20 }} />
                                <Title level={4} style={{ color: '#6c757d' }}>Giỏ hàng của bạn đang trống</Title>
                                <Button type="primary" size="large" onClick={() => navigate('/user')}>Tiếp tục mua sắm</Button>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text strong style={{ fontSize: 16 }}>{totalItems} sản phẩm</Text>
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={handleClearCart}>Xóa tất cả</Button>
                                </div>
                                {items.map((item) => (
                                    <div key={item.cartItemId || item.productId} style={{ padding: '20px', border: '1px solid #f0f0f0', borderRadius: 12, marginBottom: 16, backgroundColor: '#fff' }}>
                                        <Row align="middle" gutter={16}>
                                            <Col xs={8} sm={4}>
                                                <Image src={item.productImage || 'https://picsum.photos/200'} alt={item.productName} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: 8 }} preview={false} />
                                            </Col>
                                            <Col xs={16} sm={10}>
                                                <Title level={5} style={{ margin: 0, fontSize: 16 }}>{item.productName}</Title>
                                                <Text type="secondary">Đơn giá: {(item.unitPrice || 0).toLocaleString('vi-VN')} ₫</Text>
                                            </Col>
                                            <Col xs={12} sm={6} style={{ textAlign: 'center', marginTop: '10px' }}>
                                                <Space>
                                                    <Button shape="circle" size="small" onClick={() => handleQuantityChange(item.cartItemId, item.orderQuantity - 1)} disabled={item.orderQuantity <= 1}>-</Button>
                                                    <Input style={{ width: 40, textAlign: 'center', border: 'none', fontWeight: 'bold' }} value={item.orderQuantity} readOnly />
                                                    <Button shape="circle" size="small" onClick={() => handleQuantityChange(item.cartItemId, item.orderQuantity + 1)}>+</Button>
                                                </Space>
                                            </Col>
                                            <Col xs={12} sm={4} style={{ textAlign: 'right', marginTop: '10px' }}>
                                                <Text strong style={{ color: '#1890ff', fontSize: 16 }}>{((item.unitPrice || 0) * (item.orderQuantity || 0)).toLocaleString('vi-VN')} ₫</Text>
                                                <div style={{ marginTop: 5 }}>
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(item.cartItemId)} />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                            </>
                        )}
                    </Card>
                </Col>

                {/* Cột phải: Thông tin thanh toán */}
                <Col xs={24} lg={8}>
                    {items.length > 0 && (
                        <div style={{ position: 'sticky', top: 100 }}>
                            <Card className="shadow-sm" title={<span style={{fontSize: 18, fontWeight: 'bold'}}><CreditCardOutlined /> Thông tin thanh toán</span>} style={{ borderRadius: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text>Tạm tính:</Text>
                                    <Text strong>{calculateTotalPrice().toLocaleString('vi-VN')} ₫</Text>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 18 }}>
                                    <Text strong>Tổng cộng:</Text>
                                    <Text strong style={{ color: '#ff4d4f' }}>{calculateTotalPrice().toLocaleString('vi-VN')} ₫</Text>
                                </div>
                                <div style={{ marginBottom: 20, color: '#8c8c8c', textAlign: 'right', fontSize: 12 }}>(~${calculateTotalPriceInUSD()} USD)</div>
                                <Divider style={{ margin: '15px 0' }} />
                                
                                <Form form={form} layout="vertical" onFinish={handleCheckout} initialValues={{ receiveAddress: '', receiveName: '', receivePhone: '', note: '' }}>
                                    <Form.Item name="receiveName" rules={[{ required: true, message: 'Nhập họ tên!' }]}><Input placeholder="Họ tên người nhận" /></Form.Item>
                                    <Form.Item name="receivePhone" rules={[{ required: true, message: 'Nhập SĐT!' }, { pattern: /^\d{10,11}$/, message: 'SĐT không hợp lệ!' }]}><Input placeholder="Số điện thoại" maxLength={15} /></Form.Item>
                                    <Form.Item name="receiveAddress" rules={[{ required: true, message: 'Nhập địa chỉ!' }]}><Input placeholder="Địa chỉ giao hàng" /></Form.Item>
                                    <Form.Item name="note"><Input.TextArea placeholder="Ghi chú (tùy chọn)" rows={2} /></Form.Item>
                                    
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>Phương thức thanh toán:</Text>
                                        <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                                            <Space direction="vertical" style={{ width: '100%' }}>
                                                <Radio value="cod" style={{ border: '1px solid #d9d9d9', padding: '10px', borderRadius: 8, width: '100%' }}>Thanh toán khi nhận hàng (COD)</Radio>
                                                <Radio value="paypal" style={{ border: '1px solid #d9d9d9', padding: '10px', borderRadius: 8, width: '100%' }}>Thanh toán qua PayPal</Radio>
                                            </Space>
                                        </Radio.Group>
                                    </div>
                                    
                                    <Button type="primary" htmlType="submit" block size="large" loading={paymentLoading} style={{ borderRadius: 8, height: 50, fontSize: 18, fontWeight: 'bold', backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}>ĐẶT HÀNG NGAY</Button>
                                </Form>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>

            {/* Modal Thành công */}
            <Modal
                title={<span style={{ color: '#52c41a', fontSize: 20 }}>🎉 Đặt hàng thành công!</span>}
                open={!!orderInfo}
                onCancel={() => { setOrderInfo(null); navigate('/user'); }}
                footer={[<Button key="home" type="primary" onClick={() => { setOrderInfo(null); navigate('/user'); }}>Về trang chủ</Button>]}
                centered
            >
                {orderInfo && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" style={{ width: 80, marginBottom: 20 }} />
                        <p style={{ fontSize: 16 }}>Mã đơn hàng: <strong>{orderInfo.orderId || 'N/A'}</strong></p>
                        <p style={{ fontSize: 16 }}>Tổng tiền: <strong style={{ color: '#ff4d4f' }}>{orderInfo.totalPrice?.toLocaleString('vi-VN')} ₫</strong></p>
                        <p style={{ color: '#8c8c8c' }}>Cảm ơn bạn đã tin tưởng và mua sắm tại APHONE!</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CartPage;