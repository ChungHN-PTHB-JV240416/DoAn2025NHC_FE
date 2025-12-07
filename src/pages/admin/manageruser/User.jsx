import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Tooltip, Tag, Checkbox, Card, Modal, App, ConfigProvider } from 'antd';
import { LockOutlined, UnlockOutlined, UserAddOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { 
  fetchUsers, 
  fetchRoles, 
  updateUserRoles, 
  toggleUserStatus, 
  setCurrentPage, 
  setPageSize, 
  setSelectedUser, 
  setSelectedRoles, 
  clearSelectedUser 
} from '../../../redux/reducers/UserSlice';

const { Title } = Typography;

// --- Component con chứa logic chính ---
const UserListContent = () => {
  // Sử dụng hook của AntD App để gọi modal chuẩn, không bị lỗi context
  const { modal } = App.useApp();
  
  const dispatch = useDispatch();
  const { users, totalUsers, roles, loading, currentPage, pageSize, selectedUser, selectedRoles } = useSelector((state) => state.users);
  
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  
  // Fetch dữ liệu khi vào trang hoặc đổi trang
  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, size: pageSize }));
    dispatch(fetchRoles());
  }, [dispatch, currentPage, pageSize]);

  // Xử lý khóa/mở khóa tài khoản
  const confirmToggleStatus = (user) => {
    modal.confirm({
      title: user.status ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      content: `Bạn có chắc chắn muốn ${user.status ? 'khóa' : 'mở khóa'} người dùng "${user.username}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okType: user.status ? 'danger' : 'primary',
      onOk: async () => {
        try {
          await dispatch(toggleUserStatus({ userId: user.id, status: !user.status })).unwrap();
          toast.success(`Đã ${user.status ? 'khóa' : 'mở khóa'} thành công!`);
        } catch (error) {
          toast.error(error || 'Lỗi cập nhật trạng thái');
        }
      },
    });
  };

  // Xử lý cập nhật quyền
  const handleSubmitRoles = async () => {
    if (!selectedUser) return;

    const currentRoleIds = selectedUser.roles.map(r => r.id);
    const rolesToAdd = selectedRoles.filter(id => !currentRoleIds.includes(id));
    const rolesToRemove = currentRoleIds.filter(id => !selectedRoles.includes(id));

    try {
      await dispatch(updateUserRoles({ userId: selectedUser.id, rolesToAdd, rolesToRemove })).unwrap();
      toast.success('Cập nhật quyền thành công!');
      setIsRoleModalVisible(false);
      dispatch(fetchUsers({ page: currentPage, size: pageSize })); // Reload lại list
      dispatch(clearSelectedUser());
    } catch (error) {
      toast.error(error || 'Lỗi cập nhật quyền');
    }
  };

  // Cấu hình các cột của bảng
  const columns = [
    { 
      title: 'STT', 
      key: 'index',
      render: (_, __, i) => (currentPage - 1) * pageSize + i + 1, 
      align: 'center', 
      width: 60 
    },
    { 
      title: 'Tài khoản', 
      dataIndex: 'username', 
      key: 'username',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    { 
      title: 'Email', 
      dataIndex: 'email', 
      key: 'email',
      responsive: ['md'] 
    },
    { 
      title: 'Họ tên', 
      dataIndex: 'fullname', 
      key: 'fullname' 
    },
    { 
      title: 'Vai trò', 
      dataIndex: 'roles', 
      key: 'roles',
      render: (userRoles) => (
        <Space wrap>
          {userRoles.map(r => (
            <Tag color={r.roleType === 'ADMIN' ? 'red' : 'blue'} key={r.id}>
              {r.roleType}
            </Tag>
          ))}
        </Space>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (status) => (
        <Tag color={status ? 'success' : 'default'}>
          {status ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ) 
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Phân quyền">
            <Button 
              icon={<UserAddOutlined />} 
              onClick={() => {
                dispatch(setSelectedUser(record));
                setIsRoleModalVisible(true);
              }} 
            />
          </Tooltip>
          
          <Tooltip title={record.status ? 'Khóa tài khoản' : 'Mở khóa'}>
            <Button 
              danger={record.status} // Nếu đang active thì nút màu đỏ (để khóa)
              type={!record.status ? 'primary' : 'default'} // Nếu đang khóa thì nút xanh (để mở)
              icon={record.status ? <LockOutlined /> : <UnlockOutlined />} 
              onClick={() => confirmToggleStatus(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Thay Card bordered={false} bằng variant="borderless" để fix warning */}
      <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
           <Title level={4} style={{ margin: 0 }}>Quản lý người dùng</Title>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalUsers,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
            onChange: (p, s) => { 
                dispatch(setCurrentPage(p)); 
                dispatch(setPageSize(s)); 
            }
          }}
          scroll={{ x: 800 }} // Thêm scroll ngang cho mobile
        />
      </Card>

      {/* Modal Phân Quyền */}
      <Modal 
        title={`Phân quyền: ${selectedUser?.username}`} 
        open={isRoleModalVisible} 
        onOk={handleSubmitRoles}
        onCancel={() => { setIsRoleModalVisible(false); dispatch(clearSelectedUser()); }}
        centered
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
            <p style={{ marginBottom: 15 }}>Vui lòng chọn các vai trò:</p>
            <Space direction="vertical" style={{ width: '100%' }}>
                {roles.map(role => (
                    <Card 
                        key={role.id} 
                        size="small" 
                        hoverable 
                        variant="borderless"
                        style={{ 
                            background: selectedRoles.includes(role.id) ? '#e6f7ff' : '#f5f5f5',
                            cursor: 'pointer',
                            border: selectedRoles.includes(role.id) ? '1px solid #1890ff' : '1px solid transparent'
                        }}
                        onClick={() => {
                            const newRoles = selectedRoles.includes(role.id)
                                ? selectedRoles.filter(id => id !== role.id)
                                : [...selectedRoles, role.id];
                            dispatch(setSelectedRoles(newRoles));
                        }}
                    >
                        <Checkbox checked={selectedRoles.includes(role.id)}>
                            {role.roleType}
                        </Checkbox>
                    </Card>
                ))}
            </Space>
        </div>
      </Modal>
    </div>
  );
};

// --- Component Chính ---
// Phải bọc trong <App> để dùng được hook Modal, Message, Notification của AntD 5.x
const User = () => {
  return (
    <App>
      <UserListContent />
    </App>
  );
};

export default User;