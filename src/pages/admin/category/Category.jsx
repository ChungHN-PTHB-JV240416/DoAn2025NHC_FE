import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Space, Typography, Card, Modal, Tooltip, Descriptions, Form, Input, Switch, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { fetchCategories, fetchCategoryDetail, addCategory, updateCategory, deleteCategory, setCurrentPage, setPageSize, setSearchText, clearSelectedCategory } from '../../../redux/reducers/CategorySlice';

const { Title } = Typography;
const { TextArea } = Input;

const Category = () => {
  const dispatch = useDispatch();
  const { filteredCategories, selectedCategory, loading, error, currentPage, pageSize, searchText } = useSelector((state) => state.categories);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const init = async () => {
        await dispatch(fetchCategories());
        setInitialLoading(false);
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleEdit = (record) => {
    dispatch(fetchCategoryDetail(record.categoryId)).then((res) => {
        if(res.meta.requestStatus === 'fulfilled') {
            editForm.setFieldsValue(res.payload);
            setIsEditModalVisible(true);
        }
    });
  };

  const handleDelete = (id, name) => {
    Modal.confirm({
        title: 'Xóa danh mục',
        content: `Bạn có chắc muốn xóa "${name}"?`,
        okType: 'danger',
        onOk: () => dispatch(deleteCategory(id)).then(() => {
            toast.success('Đã xóa thành công');
            dispatch(fetchCategories());
        })
    });
  };

  const columns = [
    { title: '#', render: (_, __, i) => (currentPage - 1) * pageSize + i + 1, width: 60, align: 'center' },
    { title: 'Tên danh mục', dataIndex: 'categoryName', sorter: (a, b) => a.categoryName.localeCompare(b.categoryName), width: '25%' },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    { 
        title: 'Trạng thái', 
        dataIndex: 'status', 
        align: 'center',
        render: (status) => <Tag color={status ? 'processing' : 'default'}>{status ? 'Hoạt động' : 'Vô hiệu'}</Tag> 
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem"><Button icon={<EyeOutlined />} onClick={() => {
              dispatch(fetchCategoryDetail(record.categoryId));
              setIsModalVisible(true);
          }} /></Tooltip>
          <Tooltip title="Sửa"><Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)} /></Tooltip>
          <Tooltip title="Xóa"><Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.categoryId, record.categoryName)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Đã sửa lỗi: Thay bordered={false} bằng variant="borderless" */}
      <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Danh Mục</Title>
          <Space>
            <Input.Search 
                placeholder="Tìm danh mục..." 
                onSearch={(val) => dispatch(setSearchText(val))} 
                style={{ width: 250 }} 
                allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setIsAddModalVisible(true); form.resetFields(); }}>Thêm mới</Button>
          </Space>
        </div>

        <Table
          loading={initialLoading || loading}
          columns={columns}
          dataSource={filteredCategories}
          rowKey="categoryId"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredCategories.length,
            showTotal: (t) => `Tổng ${t} danh mục`,
            onChange: (p, s) => { dispatch(setCurrentPage(p)); dispatch(setPageSize(s)); }
          }}
        />
      </Card>

      {/* ADD MODAL */}
      <Modal title="Thêm danh mục" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null} centered>
        <Form form={form} layout="vertical" onFinish={(values) => {
            dispatch(addCategory(values)).then((res) => {
                if(res.meta.requestStatus === 'fulfilled') {
                    toast.success('Thêm thành công');
                    setIsAddModalVisible(false);
                    dispatch(fetchCategories());
                }
            });
        }}>
            <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} />
            </Form.Item>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => setIsAddModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Lưu</Button>
            </div>
        </Form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal title="Sửa danh mục" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null} centered>
        <Form form={editForm} layout="vertical" onFinish={(values) => {
            dispatch(updateCategory({ categoryId: selectedCategory.categoryId, categoryData: values })).then((res) => {
                if(res.meta.requestStatus === 'fulfilled') {
                    toast.success('Cập nhật thành công');
                    setIsEditModalVisible(false);
                    dispatch(fetchCategories());
                }
            });
        }}>
            <Form.Item name="categoryName" label="Tên danh mục" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading}>Cập nhật</Button>
            </div>
        </Form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal title="Chi tiết" open={isModalVisible} onCancel={() => { setIsModalVisible(false); dispatch(clearSelectedCategory()); }} footer={null}>
        {selectedCategory && (
            <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">{selectedCategory.categoryId}</Descriptions.Item>
                <Descriptions.Item label="Tên">{selectedCategory.categoryName}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{selectedCategory.description}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={selectedCategory.status ? 'green' : 'red'}>{selectedCategory.status ? 'Hoạt động' : 'Tắt'}</Tag>
                </Descriptions.Item>
            </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Category;