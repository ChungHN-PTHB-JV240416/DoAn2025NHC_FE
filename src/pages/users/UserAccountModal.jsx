import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserAccount, updateUserAccount, changePassword } from '../../redux/reducers/AccountUserSlice';
import { fetchWishList, removeFromWishList } from '../../redux/reducers/WishListSlice';
import { Modal, Tabs, Form, Input, Button, Typography, Spin, Avatar, Upload, Table, Row, Col, Card } from 'antd';
import { toast } from 'react-toastify';
import { UserOutlined, KeyOutlined, HeartOutlined, LogoutOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { removeToken, removeUserId, removeRoles } from '../../api/index';

const { Title, Text } = Typography;

const UserAccountModal = ({ visible, onClose, userId, onLogout }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userAccount, loading } = useSelector((state) => state.accountUser);
    const { wishList } = useSelector((state) => state.wishList);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (visible && userId) {
            dispatch(fetchUserAccount(userId));
            dispatch(fetchWishList());
        }
    }, [visible, userId, dispatch]);

    useEffect(() => {
        if (userAccount?.avatar) {
            setFileList([{ uid: '-1', name: 'avatar', status: 'done', url: userAccount.avatar }]);
        }
    }, [userAccount]);

    const handleUpdateAccount = async (values) => {
        try {
            const formData = new FormData();
            formData.append('fullname', values.fullname);
            formData.append('phone', values.phone);
            formData.append('address', values.address);
            
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('avatar', fileList[0].originFileObj);
            }

            await dispatch(updateUserAccount({ userId, data: formData })).unwrap();
            dispatch(fetchUserAccount(userId)); // Reload để header cập nhật
            toast.success('✨ Cập nhật hồ sơ thành công!');
        } catch (error) {
            handleError(error);
        }
    };

    const handleChangePassword = async (values) => {
        try {
            await dispatch(changePassword({ userId, data: values })).unwrap();
            toast.success('🔒 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            setTimeout(() => {
                onLogout(); 
                onClose();
                navigate('/login');
            }, 2000);
        } catch (error) {
            handleError(error);
        }
    };

    const handleError = (error) => {
        if (error === 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại') {
            toast.error(error);
            setTimeout(() => {
                onLogout();
                navigate('/login');
            }, 3000);
        } else {
            toast.error(error || 'Có lỗi xảy ra!');
        }
    };

    const handleRemoveFromWishList = async (wishListId) => {
        try {
            await dispatch(removeFromWishList(wishListId)).unwrap();
            toast.success('Đã xóa khỏi danh sách yêu thích!');
            dispatch(fetchWishList());
        } catch (error) {
            toast.error('Lỗi khi xóa!');
        }
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1));
    };

    const wishListColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'productImage',
            key: 'productImage',
            render: (image, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar shape="square" size={50} src={image} />
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{record.productName}</div>
                        <div style={{ color: '#ff4d4f', fontSize: '12px' }}>
                            {record.price ? record.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button type="text" danger icon={<LogoutOutlined rotate={180} />} onClick={() => handleRemoveFromWishList(record.wishListId)} />
            ),
        },
    ];

    const renderProfileTab = () => (
        <Form layout="vertical" onFinish={handleUpdateAccount} initialValues={userAccount} key={userAccount ? `profile-${userAccount.updatedAt}` : 'loading'}>
            <Row gutter={16}>
                <Col span={12}><Form.Item label="Họ tên" name="fullname" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={12}><Form.Item label="Số điện thoại" name="phone" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={24}><Form.Item label="Địa chỉ" name="address"><Input.TextArea rows={2} /></Form.Item></Col>
                <Col span={24}><Button type="primary" htmlType="submit" block>Lưu thay đổi</Button></Col>
            </Row>
        </Form>
    );

    const renderSecurityTab = () => (
        <Form layout="vertical" onFinish={handleChangePassword}>
            <Form.Item label="Mật khẩu hiện tại" name="oldPass" rules={[{ required: true }]}><Input.Password /></Form.Item>
            <Form.Item label="Mật khẩu mới" name="newPass" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
            <Form.Item label="Xác nhận mật khẩu" name="confirmNewPass" rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPass') === value) return Promise.resolve(); return Promise.reject(new Error('Mật khẩu không khớp!')); } })]}><Input.Password /></Form.Item>
            <Button type="primary" danger htmlType="submit" block>Đổi mật khẩu</Button>
        </Form>
    );

    const items = [
        { key: '1', label: <span><UserOutlined /> Hồ sơ</span>, children: renderProfileTab() },
        { key: '2', label: <span><HeartOutlined /> Yêu thích ({wishList?.length || 0})</span>, children: <Table dataSource={wishList} columns={wishListColumns} rowKey="wishListId" pagination={{ pageSize: 3 }} size="small" /> },
        { key: '3', label: <span><KeyOutlined /> Bảo mật</span>, children: renderSecurityTab() },
        { key: '4', label: <span style={{ color: 'red' }}><LogoutOutlined /> Đăng xuất</span>, children: <div className="text-center p-4"><Button type="primary" danger onClick={onLogout}>Xác nhận đăng xuất</Button></div> }
    ];

    return (
        <Modal open={visible} onCancel={onClose} footer={null} width={750} centered styles={{ body: { padding: 0 } }}>
            <Row>
                <Col span={8} style={{ background: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', borderRight: '1px solid #e8e8e8' }}>
                     <div style={{ position: 'relative', marginBottom: 15 }}>
                        <Avatar size={100} src={userAccount?.avatar} icon={<UserOutlined />} style={{ border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                        <Upload fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} accept="image/*" showUploadList={false}>
                            <Button type="primary" shape="circle" icon={<CameraOutlined />} size="small" style={{ position: 'absolute', bottom: 0, right: 0 }} />
                        </Upload>
                     </div>
                     <Title level={5} style={{ margin: 0 }}>{userAccount?.fullname || 'User'}</Title>
                     <Text type="secondary" style={{ fontSize: '12px' }}>{userAccount?.email}</Text>
                </Col>
                <Col span={16}><div style={{ padding: '20px' }}><Tabs defaultActiveKey="1" items={items} /></div></Col>
            </Row>
        </Modal>
    );
};

export default UserAccountModal;