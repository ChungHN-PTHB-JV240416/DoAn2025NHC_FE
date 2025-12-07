import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Form, Input, Switch, Upload, Descriptions, Image, Tag, App } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { fetchBrands, fetchBrandDetail, addBrand, updateBrand, deleteBrand, setCurrentPage, setPageSize, setSearchText } from '../../../redux/reducers/BrandSlice';

const { Title } = Typography;
const { TextArea } = Input;

// Tách nội dung ra Component con để dùng App hook
const BrandContent = () => {
  const { modal } = App.useApp(); // Hook chuẩn AntD 5
  const dispatch = useDispatch();
  
  const { filteredBrands, selectedBrand, loading, error, currentPage, pageSize } = useSelector((state) => state.brands);
  
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const [addFileList, setAddFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [initialImage, setInitialImage] = useState(null);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleViewDetail = (record) => {
    dispatch(fetchBrandDetail(record.brandId)).then(() => setIsDetailModalVisible(true));
  };

  const handleAddModalOpen = () => {
    setIsAddModalVisible(true);
    addForm.resetFields();
    setAddFileList([]);
  };

  const handleEditModalOpen = (record) => {
    dispatch(fetchBrandDetail(record.brandId)).then((result) => {
      if(result.meta.requestStatus === 'fulfilled') {
          const brandData = result.payload;
          editForm.setFieldsValue({
            brandName: brandData.brandName,
            description: brandData.description,
            status: brandData.status,
          });
          setInitialImage(brandData.image || null);
          setEditFileList([]);
          setIsEditModalVisible(true);
      }
    });
  };

  const handleDelete = (brandId, brandName) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thương hiệu "${brandName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
            await dispatch(deleteBrand(brandId)).unwrap();
            toast.success('Xóa thành công!');
            dispatch(fetchBrands());
        } catch (err) {
            toast.error(err || 'Lỗi xóa');
        }
      },
    });
  };

  const columns = [
    { title: '#', render: (_, __, index) => (currentPage - 1) * pageSize + index + 1, width: 60, align: 'center' },
    { title: 'Tên thương hiệu', dataIndex: 'brandName', sorter: (a, b) => a.brandName.localeCompare(b.brandName), width: '20%' },
    { 
        title: 'Hình ảnh', 
        dataIndex: 'image', 
        align: 'center',
        render: (image) => image ? <Image src={image} width={50} height={50} style={{ objectFit: 'contain', borderRadius: 4, border: '1px solid #f0f0f0' }} /> : <Tag>No Image</Tag> 
    },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      align: 'center',
      render: (status) => <Tag color={status ? 'success' : 'error'}>{status ? 'Hoạt động' : 'Ngừng'}</Tag> 
    },
    { 
      title: 'Hành động', 
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem"><Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
          <Tooltip title="Sửa"><Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEditModalOpen(record)} /></Tooltip>
          <Tooltip title="Xóa"><Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.brandId, record.brandName)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Sửa lỗi Warning: Thay bordered={false} bằng variant="borderless" */}
      <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Thương Hiệu</Title>
          <Space>
            <Input.Search 
                placeholder="Tìm kiếm..." 
                onSearch={(val) => dispatch(setSearchText(val))} 
                style={{ width: 250 }} 
                allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddModalOpen}>Thêm mới</Button>
          </Space>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredBrands}
          rowKey="brandId"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredBrands.length,
            showTotal: (total) => `Tổng ${total} mục`,
            onChange: (page, size) => {
                dispatch(setCurrentPage(page));
                dispatch(setPageSize(size));
            }
          }}
        />
      </Card>

      {/* ADD MODAL */}
      <Modal 
        title="Thêm thương hiệu mới" 
        open={isAddModalVisible} 
        onCancel={() => setIsAddModalVisible(false)} 
        footer={null}
        width={600}
        centered
        maskClosable={false}
      >
        <Form form={addForm} layout="vertical" onFinish={(values) => {
            dispatch(addBrand({ ...values, image: addFileList })).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    toast.success('Thêm thành công!');
                    setIsAddModalVisible(false);
                    dispatch(fetchBrands());
                }
            });
        }} initialValues={{ status: true }}>
            <Form.Item name="brandName" label="Tên thương hiệu" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                <Input placeholder="Nhập tên..." />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Hình ảnh">
                <Upload listType="picture-card" fileList={addFileList} onChange={({ fileList }) => setAddFileList(fileList)} beforeUpload={() => false} maxCount={1}>
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>
                </Upload>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setIsAddModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Lưu lại</Button>
            </div>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal 
        title="Cập nhật thương hiệu" 
        open={isEditModalVisible} 
        onCancel={() => setIsEditModalVisible(false)} 
        footer={null}
        width={600}
        centered
        maskClosable={false}
      >
        <Form form={editForm} layout="vertical" onFinish={(values) => {
            dispatch(updateBrand({ brandId: selectedBrand.brandId, brandData: { ...values, image: editFileList } })).then((res) => {
                if (res.meta.requestStatus === 'fulfilled') {
                    toast.success('Cập nhật thành công!');
                    setIsEditModalVisible(false);
                    dispatch(fetchBrands());
                }
            });
        }}>
            <Form.Item name="brandName" label="Tên thương hiệu" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Hình ảnh">
                <div style={{ marginBottom: 10 }}>
                    {initialImage && <Image src={initialImage} width={100} style={{ borderRadius: 4 }} />}
                </div>
                <Upload listType="picture-card" fileList={editFileList} onChange={({ fileList }) => setEditFileList(fileList)} beforeUpload={() => false} maxCount={1}>
                    <div><PlusOutlined /><div style={{ marginTop: 8 }}>Đổi ảnh</div></div>
                </Upload>
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
            </Form.Item>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Cập nhật</Button>
            </div>
        </Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal title="Chi tiết thương hiệu" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={null} centered>
        {selectedBrand && (
            <Descriptions bordered column={1} labelStyle={{ fontWeight: 'bold', width: '120px' }}>
                <Descriptions.Item label="Tên">{selectedBrand.brandName}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{selectedBrand.description}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><Tag color={selectedBrand.status ? 'green' : 'red'}>{selectedBrand.status ? 'Hoạt động' : 'Ngừng'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Hình ảnh">
                    {selectedBrand.image ? <Image src={selectedBrand.image} width={150} /> : 'Không có ảnh'}
                </Descriptions.Item>
            </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// Wrap trong App để Modal hoạt động chuẩn
const Brand = () => (
    <App>
        <BrandContent />
    </App>
);

export default Brand;