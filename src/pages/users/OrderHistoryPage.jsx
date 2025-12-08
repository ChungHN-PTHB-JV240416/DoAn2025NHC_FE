    import React, { useEffect, useState } from 'react';
    import { useSelector, useDispatch } from 'react-redux';
    import {
        fetchUserOrderHistory,
        fetchOrderDetails,
        fetchOrdersByStatus,
        cancelOrder,
        clearOrderDetails,
        resetFetchStatus,
    } from '../../redux/reducers/OrderSliceUser';
    import { Card, Row, Col, Typography, Spin, Button, Modal, Select, Space, Tag, Descriptions, Empty, Divider } from 'antd';
    import { CalendarOutlined, DollarCircleOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
    import { toast } from 'react-toastify';

    const { Title, Text } = Typography;
    const { Option } = Select;

    const OrderHistoryPage = () => {
        const dispatch = useDispatch();
        const { isAuthenticated, user } = useSelector((state) => state.auth);
        const { orderHistory, orderDetails, loading, error } = useSelector(
            (state) => state.userOrders
        );
        const [selectedStatus, setSelectedStatus] = useState('ALL');
        const [isModalVisible, setIsModalVisible] = useState(false);

        // Ánh xạ trạng thái sang màu sắc và text
        const getStatusTag = (status) => {
            switch (status) {
                case 'WAITING': return <Tag color="orange">Chờ xử lý</Tag>;
                case 'CONFIRM': return <Tag color="blue">Đã xác nhận</Tag>;
                case 'DELIVERY': return <Tag color="cyan">Đang giao</Tag>;
                case 'SUCCESS': return <Tag color="green">Thành công</Tag>;
                case 'CANCEL': return <Tag color="red">Đã hủy</Tag>;
                default: return <Tag>{status}</Tag>;
            }
        };

        useEffect(() => {
            if (isAuthenticated && user?.userId) {
                if (selectedStatus === 'ALL') {
                    dispatch(fetchUserOrderHistory(user.userId));
                } else {
                    dispatch(fetchOrdersByStatus({ status: selectedStatus, userId: user.userId }));
                }
            }
        }, [isAuthenticated, user?.userId, dispatch, selectedStatus]);

        const handleViewDetails = (serialNumber) => {
            dispatch(fetchOrderDetails(serialNumber)).then(() => {
                setIsModalVisible(true);
            });
        };

        const handleCancelOrder = (orderId) => {
            Modal.confirm({
                title: 'Xác nhận hủy đơn',
                content: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
                okText: 'Hủy đơn',
                okType: 'danger',
                cancelText: 'Đóng',
                onOk() {
                    dispatch(cancelOrder(orderId))
                        .unwrap()
                        .then(() => {
                            toast.success('Hủy đơn hàng thành công!');
                            dispatch(resetFetchStatus());
                            // Reload lại danh sách sau khi hủy
                            if (selectedStatus === 'ALL') dispatch(fetchUserOrderHistory(user.userId));
                            else dispatch(fetchOrdersByStatus({ status: selectedStatus, userId: user.userId }));
                        })
                        .catch((err) => {
                            toast.error(err || 'Hủy đơn hàng thất bại!');
                        });
                },
            });
        };

        const handleStatusChange = (value) => {
            setSelectedStatus(value);
            dispatch(resetFetchStatus());
        };

        const handleCloseModal = () => {
            setIsModalVisible(false);
            dispatch(clearOrderDetails());
        };

        if (loading && !isModalVisible) {
            return (
                <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 20, color: '#1890ff', fontSize: '16px', fontWeight: 500 }}>
                        Đang tải lịch sử...
                    </div>
                </div>
            );
        }

        if (error) {
            return <div style={{ textAlign: 'center', color: 'red', padding: '50px' }}><h3>Lỗi: {error}</h3></div>;
        }

        return (
            <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Header Section */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <Title level={3} style={{ margin: 0, color: '#1a73e8' }}>📦 Lịch sử mua hàng</Title>
                    
                    <Space size="middle">
                        <Text strong>Trạng thái:</Text>
                        <Select
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            style={{ width: 180 }}
                            size="large"
                        >
                            <Option value="ALL">Tất cả đơn hàng</Option>
                            <Option value="WAITING">Chờ xử lý</Option>
                            <Option value="CONFIRM">Đã xác nhận</Option>
                            <Option value="DELIVERY">Đang giao hàng</Option>
                            <Option value="SUCCESS">Giao thành công</Option>
                            <Option value="CANCEL">Đã hủy</Option>
                        </Select>
                    </Space>
                </div>

                {/* Orders List */}
                {orderHistory.length === 0 ? (
                    <div style={{ background: '#fff', padding: '50px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Empty description={<span style={{ fontSize: '16px', color: '#888' }}>Bạn chưa có đơn hàng nào</span>} />
                        <Button type="primary" size="large" style={{ marginTop: 20 }} href="/user">Mua sắm ngay</Button>
                    </div>
                ) : (
                    <Row gutter={[24, 24]}>
                        {orderHistory.map((order) => (
                            <Col xs={24} sm={12} lg={8} key={order.orderId}>
                                <Card
                                    hoverable
                                    style={{ 
                                        borderRadius: '12px', 
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    // [FIX LỖI WARNING]: Thay bodyStyle bằng styles={{ body: ... }}
                                    styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>MÃ ĐƠN</Text>
                                            <Title level={5} style={{ margin: 0 }}>#{order.orderId}</Title>
                                        </div>
                                        {getStatusTag(order.status)}
                                    </div>
                                    
                                    <Divider style={{ margin: '10px 0' }} />

                                    <div style={{ marginBottom: 10 }}>
                                        <CalendarOutlined style={{ color: '#1a73e8', marginRight: 8 }} />
                                        <Text>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</Text>
                                    </div>
                                    
                                    <div style={{ marginBottom: 20 }}>
                                        <DollarCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                        <Text strong style={{ fontSize: '16px', color: '#cf1322' }}>
                                            {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                                        </Text>
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                        <Button 
                                            type="primary" 
                                            ghost 
                                            icon={<InfoCircleOutlined />} 
                                            block 
                                            onClick={() => handleViewDetails(order.serialNumber)}
                                        >
                                            Chi tiết
                                        </Button>
                                        
                                        {order.status === 'WAITING' && (
                                            <Button 
                                                danger 
                                                icon={<CloseCircleOutlined />} 
                                                onClick={() => handleCancelOrder(order.orderId)}
                                            >
                                                Hủy
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Modal Chi Tiết */}
                <Modal
                    title={<Title level={4} style={{ margin: 0, color: '#1a73e8' }}>Thông tin đơn hàng</Title>}
                    open={isModalVisible}
                    onCancel={handleCloseModal}
                    footer={[
                        <Button key="close" type="primary" onClick={handleCloseModal}>
                            Đóng lại
                        </Button>,
                    ]}
                    width={800}
                    centered
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin />
                            <div style={{ marginTop: 10, color: '#999' }}>Đang tải chi tiết...</div>
                        </div>
                    ) : (
                        orderDetails ? (
                            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                                <Descriptions.Item label="Mã đơn hàng" span={2}><Text strong copyable>{orderDetails.orderId}</Text></Descriptions.Item>
                                <Descriptions.Item label="Mã vận đơn (Serial)" span={2}>{orderDetails.serialNumber}</Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">{orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleDateString('vi-VN') : '---'}</Descriptions.Item>
                                <Descriptions.Item label="Dự kiến nhận">{orderDetails.receivedAt ? new Date(orderDetails.receivedAt).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái" span={2}>{getStatusTag(orderDetails.status)}</Descriptions.Item>
                                <Descriptions.Item label="Người nhận">{orderDetails.receiveName}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{orderDetails.receivePhone}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ" span={2}>{orderDetails.receiveAddress}</Descriptions.Item>
                                <Descriptions.Item label="Tổng thanh toán" span={2}>
                                    <Title level={4} style={{ color: '#cf1322', margin: 0 }}>
                                        {orderDetails.totalPrice?.toLocaleString('vi-VN')} VNĐ
                                    </Title>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ghi chú" span={2}>{orderDetails.note || 'Không có ghi chú'}</Descriptions.Item>
                            </Descriptions>
                        ) : (
                            <Empty description="Không tìm thấy thông tin chi tiết" />
                        )
                    )}
                </Modal>
            </div>
        );
    };

    export default OrderHistoryPage;