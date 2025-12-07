import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const ProductModal = ({ showModal, handleCloseModal, selectedProduct, onAddToCart }) => {
  return (
    <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-primary">Chi tiết sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedProduct ? (
          <Row>
            <Col md={6} className="d-flex align-items-center justify-content-center bg-light rounded p-3 mb-3 mb-md-0">
              <img
                src={selectedProduct.image || 'https://picsum.photos/400?random=5'}
                alt={selectedProduct.productName}
                className="modal-img img-fluid"
                onError={(e) => (e.target.src = 'https://picsum.photos/400?random=5')}
                // FIX ẢNH MODAL
                style={{ maxHeight: '350px', width: '100%', objectFit: 'contain' }}
              />
            </Col>
            <Col md={6}>
              <h3 className="modal-title fw-bold text-dark">{selectedProduct.productName || 'Không có tên'}</h3>
              <p className="modal-price text-danger fs-4 fw-bold my-3">
                {selectedProduct.unitPrice != null ? selectedProduct.unitPrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ
              </p>
              <div className="mb-4">
                <strong>Mô tả:</strong>
                <p className="text-muted mt-1">{selectedProduct.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
              </div>
              <div className="d-grid gap-2">
                <Button
                    variant="primary"
                    size="lg"
                    className="rounded-pill"
                    onClick={() => onAddToCart(selectedProduct.productId)}
                >
                    Thêm vào giỏ hàng
                </Button>
              </div>
            </Col>
          </Row>
        ) : (
          <p className="text-center">Đang tải dữ liệu...</p>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={handleCloseModal}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;