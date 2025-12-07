import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CardProduct from './CardProduct';

const ProductList = ({ products, onViewDetail }) => {
  return (
    <section className="product-section py-5">
      <Container>
        <Row className="gy-4"> {/* gy-4: khoảng cách hàng dọc */}
          {products.length > 0 ? (
            products.map((item) => (
              <Col lg={3} md={6} sm={12} key={item.productId} className="d-flex align-items-stretch">
                <CardProduct product={item} onViewDetail={onViewDetail} />
              </Col>
            ))
          ) : (
            <Col>
              <div className="alert alert-light text-center border">Không có sản phẩm nào để hiển thị.</div>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default ProductList;