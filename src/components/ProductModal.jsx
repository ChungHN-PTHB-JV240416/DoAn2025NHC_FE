import React from 'react';
import { Modal, Button, Row, Col, Typography, Divider, Image, Spin } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
// [ĐƯỜNG DẪN ĐÚNG]: Giữ nguyên đường dẫn của bạn
import ProductComments from '../pages/users/ProductComments';

const { Title, Text, Paragraph } = Typography;

const ProductModal = ({ showModal, handleCloseModal, selectedProduct, onAddToCart }) => {
  return (
    <Modal
      open={showModal}
      onCancel={handleCloseModal}
      width={1000}
      style={{ top: 100 }}
      footer={[
        <Button key="back" onClick={handleCloseModal}>
          Đóng
        </Button>,
      ]}
      title={<Title level={4} style={{ margin: 0, color: '#1677ff' }}>Chi tiết sản phẩm</Title>}
    >
      {selectedProduct ? (
        <>
          <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
            {/* Cột Trái: Ảnh sản phẩm */}
            <Col xs={24} md={10} style={{ textAlign: 'center' }}>
              <div style={{ padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <Image
                  src={selectedProduct.image || 'https://picsum.photos/400?random=5'}
                  alt={selectedProduct.productName}
                  fallback="https://picsum.photos/400?random=5"
                  style={{ maxHeight: '350px', width: '100%', objectFit: 'contain' }}
                />
              </div>
            </Col>

            {/* Cột Phải: Thông tin chi tiết */}
            <Col xs={24} md={14}>
              <Title level={3}>{selectedProduct.productName}</Title>
              
              <Text type="danger" strong style={{ fontSize: '24px' }}>
                {selectedProduct.unitPrice != null 
                  ? selectedProduct.unitPrice.toLocaleString('vi-VN') 
                  : 'Liên hệ'
                } VNĐ
              </Text>

              <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Text strong>Mô tả:</Text>
                <Paragraph 
                  style={{ marginTop: '5px', whiteSpace: 'pre-line', color: '#666' }}
                  ellipsis={{ rows: 5, expandable: true, symbol: 'Xem thêm' }}
                >
                  {selectedProduct.description || 'Chưa có mô tả.'}
                </Paragraph>
              </div>

              <Button
                type="primary"
                size="large"
                shape="round"
                icon={<ShoppingCartOutlined />}
                style={{ minWidth: '200px', marginTop: '10px' }}
                onClick={() => onAddToCart(selectedProduct.productId)}
              >
                Thêm vào giỏ hàng
              </Button>
            </Col>
          </Row>

          <Divider />

          {/* Phần bình luận */}
          <div style={{ backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px' }}>
            <ProductComments productId={selectedProduct.productId} />
          </div>
        </>
      ) : (
        // [FIX LỖI WARNING Ở ĐÂY]
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
            {/* Bỏ prop 'tip', thay bằng thẻ div bên dưới */}
            <Spin size="large" /> 
            <div style={{ marginTop: 15, color: '#1677ff', fontWeight: 500 }}>
                Đang tải dữ liệu...
            </div>
        </div>
      )}
    </Modal>
  );
};

export default ProductModal;