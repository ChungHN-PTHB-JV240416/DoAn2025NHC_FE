import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BASE_URL } from '../api/index';
import Banner from './Banner';
import ProductModal from '../components/ProductModal';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/reducers/CartSlice';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CategoryProductsPageUser.scss';

// KHÔNG IMPORT HEADER/FOOTER VÌ ĐÃ CÓ TRONG LAYOUT

const CategoryProductsPageUser = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fake Blog data
  const blogPosts = [
    { id: 1, title: "Chính sách bảo hành", date: "30/11/2023", image: "/image/baohanhdienthoai.jpg", description: "An tâm tuyệt đối..." },
    { id: 2, title: "Quà tặng 8/3", date: "01/21/2023", image: "/image/quaphunu.jpg", description: "Món quà thanh xuân..." },
    { id: 3, title: "Chuyển địa điểm", date: "04/02/2025", image: "/image/chuyendiadiem.jpg", description: "Không gian sang trọng..." },
    { id: 4, title: "Lịch nghỉ Tết", date: "30/11/2023", image: "/image/lichnghitet.jpg", description: "Thông báo lịch nghỉ..." },
  ];

  useEffect(() => {
    if (!isAuthenticated) { 
        navigate('/login'); 
        return; 
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // [ĐÃ SỬA]: Dùng đúng endpoint số nhiều 'categories' giống code cũ của bạn
        const response = await BASE_URL.get(`/products/categories/${categoryId}`);
        
        console.log("Dữ liệu category trả về:", response.data); // Debug xem có dữ liệu không
        
        // Xử lý dữ liệu trả về (hỗ trợ cả dạng phân trang .content và dạng mảng thường)
        const productList = response.data.content || response.data || [];
        setProducts(productList);

      } catch (err) {
        console.error('Lỗi tải sản phẩm:', err);
      } finally { 
        setLoading(false); 
      }
    };
    
    fetchProducts();
  }, [categoryId, isAuthenticated, navigate]);

  const handleViewDetail = async (productId) => {
    try {
      const response = await BASE_URL.get(`/products/${productId}`);
      setSelectedProduct(response.data);
      setShowModal(true);
    } catch { toast.error('Lỗi tải chi tiết'); }
  };

  const handleAddToCart = (productId) => {
    if (!user?.userId) { toast.error('Lỗi user!'); return; }
    dispatch(addToCart({ userId: user.userId, requestDTO: { productId, quantity: 1 } }))
      .unwrap().then(() => toast.success('Đã thêm vào giỏ!'))
      .catch(() => toast.error('Lỗi thêm giỏ hàng'));
  };

  if (loading) return <div className="text-center py-5">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-light">
      <Banner />
      <Container className="category-products-page py-5">
        <h1 className="text-center mb-5 text-uppercase fw-bold text-primary">
          {/* Logic hiển thị tên danh mục tạm thời */}
          {categoryId === '1' ? 'PHONE Main Zin' : categoryId === '2' ? 'PHONE Sách Tay' : 'Danh mục sản phẩm'}
        </h1>
        
        {products.length > 0 ? (
          <Row>
            {products.map((product) => (
              <Col md={4} sm={6} key={product.productId} className="mb-4">
                <Card className="product-card h-100 shadow-sm border-0">
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                      <Card.Img 
                        variant="top" 
                        src={product.image} 
                        style={{ height: '220px', objectFit: 'contain' }} 
                        onError={(e)=>e.target.src='https://via.placeholder.com/200'} 
                      />
                  </div>
                  <Card.Body className="d-flex flex-column bg-white">
                    <Card.Title className="fw-bold">{product.productName}</Card.Title>
                    <Card.Text className="text-danger fw-bold fs-5 mb-3">{product.unitPrice?.toLocaleString()} VNĐ</Card.Text>
                    <Button variant="outline-primary" className="w-100 mt-auto rounded-pill" onClick={() => handleViewDetail(product.productId)}>Xem chi tiết</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
            <div className="text-center text-muted py-5">
                <h4>Chưa có sản phẩm nào trong danh mục này.</h4>
            </div>
        )}

        <div className="blog-section mt-5 pt-5 border-top">
          <h2 className="text-center mb-4">Kiến thức điện thoại</h2>
          <Row>
            {blogPosts.map((post) => (
              <Col md={3} sm={6} key={post.id} className="mb-4">
                <Card className="blog-card h-100 shadow-sm border-0">
                  <Card.Img variant="top" src={post.image} style={{ height: '180px', objectFit: 'cover' }} onError={(e)=>e.target.src='https://via.placeholder.com/180'} />
                  <Card.Body>
                    <Card.Title className="fs-6 fw-bold">{post.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted small">{post.date}</Card.Subtitle>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
      <ProductModal showModal={showModal} handleCloseModal={()=>setShowModal(false)} selectedProduct={selectedProduct} onAddToCart={handleAddToCart} />
    </div>
  );
};

export default CategoryProductsPageUser;