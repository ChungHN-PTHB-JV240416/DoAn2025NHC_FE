import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Table, Button, Space, Typography, Card, Modal, 
  Tooltip, Spin, Descriptions, Form, Input, InputNumber, 
  Select, Upload, Row, Col, Image, Tag, App 
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

// Import Actions
import { 
  fetchProducts, 
  fetchProductDetail, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  setCurrentPage, 
  setPageSize, 
  setSearchText 
} from '../../../redux/reducers/ProductSlice';

import { fetchCategories } from '../../../redux/reducers/CategorySlice';
import { fetchBrands } from '../../../redux/reducers/BrandSlice';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Component con
const ProductContent = () => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // --- KHU VỰC SỬA LỖI QUAN TRỌNG ---
  // Lấy dữ liệu từ Store dựa theo đúng tên key trong store.js (products, categories, brands)
  
  // 1. Products Slice
  const { products, filteredProducts, selectedProduct, loading, currentPage, pageSize, totalElements } = useSelector((state) => state.products);

  // 2. Categories Slice
  // Destructuring { categories } từ state.categories (vì trong slice cũng đặt tên mảng là categories)
  const categoryData = useSelector((state) => state.categories);
  const categories = categoryData?.categories || []; // Fallback an toàn

  // 3. Brands Slice
  // Destructuring { brands } từ state.brands
  const brandData = useSelector((state) => state.brands);
  const brands = brandData?.brands || []; // Fallback an toàn
  // -----------------------------------

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [initialImage, setInitialImage] = useState(null);

  // Fetch dữ liệu
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchProducts({ page: currentPage, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setIsFormVisible(true);
    form.resetFields();
    setFileList([]);
    setInitialImage(null);
  };

  const handleOpenEdit = (record) => {
    dispatch(fetchProductDetail(record.productId)).then((res) => {
      if(res.meta.requestStatus === 'fulfilled') {
        const data = res.payload;
        form.setFieldsValue({
          productName: data.productName,
          sku: data.sku,
          unitPrice: data.unitPrice,
          stockQuantity: data.stockQuantity,
          soldQuantity: data.soldQuantity,
          description: data.description,
          categoryId: String(data.categoryId),
          brandId: String(data.brandId)
        });
        setInitialImage(data.image);
        setFileList([]);
        setIsEditMode(true);
        setIsFormVisible(true);
      }
    });
  };

  const handleSubmit = (values) => {
    const payload = { ...values };
    let imageFile = null;
    if (fileList.length > 0) {
        imageFile = fileList; 
    }
    const actionPayload = { ...payload, image: imageFile };

    const action = isEditMode 
      ? updateProduct({ productId: selectedProduct.productId, productData: actionPayload })
      : addProduct(actionPayload);

    dispatch(action).then((res) => {
      if(res.meta.requestStatus === 'fulfilled') {
        toast.success(isEditMode ? 'Cập nhật thành công' : 'Thêm mới thành công');
        setIsFormVisible(false);
        dispatch(fetchProducts({ page: currentPage, size: pageSize }));
      }
    });
  };

  const handleDelete = (id, name) => {
    modal.confirm({
      title: 'Xóa sản phẩm',
      content: `Bạn có chắc chắn muốn xóa sản phẩm "${name}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success('Đã xóa sản phẩm');
            dispatch(fetchProducts({ page: currentPage, size: pageSize }));
        } catch (error) {
            toast.error(error || 'Lỗi khi xóa');
        }
      }
    });
  };

  const columns = [
    { title: '#', render: (_, __, i) => (currentPage - 1) * pageSize + i + 1, width: 50, align: 'center' },
    { 
      title: 'Ảnh', 
      dataIndex: 'image', 
      align: 'center',
      render: (src) => src ? <Image src={src} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-' 
    },
    { title: 'Tên sản phẩm', dataIndex: 'productName', width: '20%', ellipsis: true, render: (text) => <Text strong>{text}</Text> },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Giá', dataIndex: 'unitPrice', render: (v) => <Text type="danger">{v?.toLocaleString()} đ</Text>, align: 'right' },
    { title: 'Kho', dataIndex: 'stockQuantity', align: 'center' },
    { 
      title: 'Danh mục', 
      dataIndex: 'categoryId',
      render: (id) => {
        const cat = categories.find(c => String(c.categoryId) === String(id));
        return <Tag color="blue">{cat ? cat.categoryName : id}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => { dispatch(fetchProductDetail(record.productId)); setIsDetailModalVisible(true); }} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" type="primary" ghost icon={<EditOutlined />} onClick={() => handleOpenEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.productId, record.productName)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Sản Phẩm</Title>
          <Space>
            <Input 
                placeholder="Tìm tên, SKU..." 
                prefix={<SearchOutlined />} 
                onChange={(e) => dispatch(setSearchText(e.target.value))} 
                style={{ width: 250 }} 
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>Thêm sản phẩm</Button>
          </Space>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredProducts}
          rowKey="productId"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalElements,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
            onChange: (p, s) => { dispatch(setCurrentPage(p)); dispatch(setPageSize(s)); },
            showSizeChanger: true
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal 
        title={isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"} 
        open={isFormVisible} 
        onCancel={() => setIsFormVisible(false)}
        footer={null}
        width={800}
        centered
        maskClosable={false}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="productName" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên!' }]}>
                        <Input placeholder="Tên sản phẩm..." />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="sku" label="Mã SKU" rules={[{ required: true, message: 'Nhập SKU!' }]}>
                        <Input placeholder="Mã SKU..." />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="unitPrice" label="Giá (VND)" rules={[{ required: true, message: 'Nhập giá!' }]}>
                        <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="stockQuantity" label="Tồn kho" rules={[{ required: true, message: 'Nhập số lượng!' }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="soldQuantity" label="Đã bán" initialValue={0}>
                        <InputNumber style={{ width: '100%' }} disabled={!isEditMode} min={0} />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
                        <Select placeholder="Chọn danh mục">
                            {categories.map(c => <Option key={c.categoryId} value={String(c.categoryId)}>{c.categoryName}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true, message: 'Chọn thương hiệu!' }]}>
                        <Select placeholder="Chọn thương hiệu">
                            {brands.map(b => <Option key={b.brandId} value={String(b.brandId)}>{b.brandName}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="description" label="Mô tả">
                <TextArea rows={4} placeholder="Mô tả sản phẩm..." />
            </Form.Item>
            <Form.Item label="Hình ảnh sản phẩm">
                <Space align="start">
                    {initialImage && (
                        <div style={{ border: '1px solid #d9d9d9', padding: 5, borderRadius: 4 }}>
                            <Image src={initialImage} width={80} height={80} style={{ objectFit: 'contain' }} />
                        </div>
                    )}
                    <Upload 
                        listType="picture-card" 
                        fileList={fileList} 
                        onChange={({ fileList }) => setFileList(fileList)} 
                        beforeUpload={() => false} 
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                    </Upload>
                </Space>
            </Form.Item>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
                <Button onClick={() => setIsFormVisible(false)} style={{ marginRight: 8 }}>Hủy</Button>
                <Button type="primary" htmlType="submit" loading={loading} icon={isEditMode ? <EditOutlined /> : <PlusOutlined />}>
                    {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            </div>
        </Form>
      </Modal>

      <Modal title="Chi tiết sản phẩm" open={isDetailModalVisible} onCancel={() => setIsDetailModalVisible(false)} footer={null} centered width={600}>
        {selectedProduct ? (
            <Descriptions bordered column={1} labelStyle={{ width: 140, fontWeight: 600 }}>
                <Descriptions.Item label="Tên">{selectedProduct.productName}</Descriptions.Item>
                <Descriptions.Item label="SKU">{selectedProduct.sku}</Descriptions.Item>
                <Descriptions.Item label="Giá"><Text type="danger">{selectedProduct.unitPrice?.toLocaleString()} đ</Text></Descriptions.Item>
                <Descriptions.Item label="Tồn kho">{selectedProduct.stockQuantity}</Descriptions.Item>
                <Descriptions.Item label="Đã bán">{selectedProduct.soldQuantity}</Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                    {categories.find(c => String(c.categoryId) === String(selectedProduct.categoryId))?.categoryName || selectedProduct.categoryId}
                </Descriptions.Item>
                <Descriptions.Item label="Thương hiệu">
                    {brands.find(b => String(b.brandId) === String(selectedProduct.brandId))?.brandName || selectedProduct.brandId}
                </Descriptions.Item>
                <Descriptions.Item label="Ảnh">
                    {selectedProduct.image ? <Image src={selectedProduct.image} width={150} /> : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">{selectedProduct.description}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{new Date(selectedProduct.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
            </Descriptions>
        ) : <Spin className="d-block text-center" />}
      </Modal>
    </div>
  );
};

const Product = () => {
  return (
    <App>
      <ProductContent />
    </App>
  );
};

export default Product;