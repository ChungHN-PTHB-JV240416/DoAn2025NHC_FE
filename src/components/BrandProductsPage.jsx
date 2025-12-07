import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { BASE_URL } from '../api/index'; // Dùng API công khai
import ProductModal from '../components/ProductModal';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/reducers/CartSlice';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/BrandProductsPage.scss';

// KHÔNG IMPORT HEADER/FOOTER

const BrandProductsPage = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Lấy user để kiểm tra khi bấm mua hàng
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]); // Dùng để hiển thị sidebar
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1. Lấy danh sách thương hiệu (Sidebar) - KHÔNG cần đăng nhập
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const response = await BASE_URL.get('/brands');
        setBrands(response.data.content || response.data || []);
      } catch (err) {
        console.error("Lỗi tải thương hiệu:", err);
      } finally { setLoadingBrands(false); }
    };
    fetchBrands();
  }, []);

  // 2. Lấy sản phẩm theo Brand ID - KHÔNG cần đăng nhập
  useEffect(() => {
    if (!brandId) return;
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Gọi API public lấy sản phẩm theo brand
        const response = await BASE_URL.get(`/products/brand/${brandId}`); 
        setProducts(response.data.content || response.data || []);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        // Không setProducts([]) ở đây để giữ lại state cũ hoặc hiển thị thông báo lỗi tùy ý
      } finally { setLoadingProducts(false); }
    };
    fetchProducts();
  }, [brandId]);

  // Điều hướng khi click vào sidebar
  const handleBrandClick = (id) => navigate(`/brands/${id}`);

  // Xem chi tiết sản phẩm
  const handleViewDetail = async (productId) => {
    try {
      const response = await BASE_URL.get(`/products/${productId}`);
      setSelectedProduct(response.data);
      setShowModal(true);
    } catch { toast.error('Lỗi tải chi tiết sản phẩm'); }
  };

  // 3. Mua hàng - CẦN ĐĂNG NHẬP
  const handleAddToCart = (productId) => {
    if (!isAuthenticated) { 
        toast.info('Vui lòng đăng nhập để mua hàng!');
        navigate('/login'); 
        return; 
    }
    
    if (!user?.userId) {
        toast.error('Lỗi thông tin người dùng, vui lòng đăng nhập lại.');
        return;
    }

    dispatch(addToCart({ userId: user.userId, requestDTO: { productId, quantity: 1 } }))
      .unwrap().then(() => toast.success('Đã thêm vào giỏ hàng!'))
      .catch((err) => toast.error(err || 'Lỗi thêm giỏ hàng'));
  };

  // Helper tìm tên thương hiệu hiện tại để hiển thị
  const currentBrandName = brands.find(b => String(b.brandId) === String(brandId))?.brandName || "Thương hiệu";

  if (loadingBrands && loadingProducts) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <div className="bg-light" style={{ minHeight: '80vh' }}>
      <Container className="brand-products-page py-5">
        <Row>
          {/* Cột trái: Sidebar Thương hiệu */}
          <Col md={3} className="mb-4">
            <div className="brand-filter bg-white p-4 rounded shadow-sm">
              <h4 className="text-primary fw-bold mb-3 border-bottom pb-2">THƯƠNG HIỆU</h4>
              {brands.length > 0 ? (
                <ul className="list-unstyled brand-list">
                  {brands.map((brand) => (
                    <li key={brand.brandId}
                      className={`brand-item py-2 px-3 mb-2 rounded ${String(brandId) === String(brand.brandId) ? 'bg-primary text-white' : 'text-dark hover-bg-light'}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => handleBrandClick(brand.brandId)}
                    >
                      {brand.brandName}
                    </li>
                  ))}
                </ul>
              ) : <p>Không có dữ liệu.</p>}
            </div>
          </Col>

          {/* Cột phải: Danh sách sản phẩm */}
          <Col md={9}>
            <h2 className="mb-4 fw-bold text-dark border-start border-4 border-primary ps-3">
              Sản phẩm: {currentBrandName}
            </h2>
            
            {loadingProducts ? <div className="text-center">Đang tải sản phẩm...</div> : (
              <Row>
                {products.length > 0 ? products.map((product) => (
                  <Col md={4} sm={6} key={product.productId} className="mb-4">
                    <Card className="product-card h-100 shadow-sm border-0">
                      <div style={{ padding: '15px', textAlign: 'center' }}>
                          <Card.Img 
                            variant="top" 
                            src={product.image} 
                            style={{ height: '200px', objectFit: 'contain' }} 
                            onError={(e)=>e.target.src='https://via.placeholder.com/200?text=No+Image'} 
                          />
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6 fw-bold text-truncate" title={product.productName}>
                            {product.productName}
                        </Card.Title>
                        <Card.Text className="text-danger fw-bold fs-5 mb-3">
                            {product.unitPrice?.toLocaleString('vi-VN')} VNĐ
                        </Card.Text>
                        <Button 
                            variant="outline-primary" 
                            className="w-100 mt-auto rounded-pill" 
                            onClick={() => handleViewDetail(product.productId)}
                        >
                            Xem chi tiết
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                )) : (
                    <div className="col-12">
                        <div className="alert alert-info text-center">Chưa có sản phẩm nào thuộc thương hiệu này.</div>
                    </div>
                )}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
      
      <ProductModal 
        showModal={showModal} 
        handleCloseModal={()=>setShowModal(false)} 
        selectedProduct={selectedProduct} 
        onAddToCart={handleAddToCart} 
      />
    </div>
  );
};

export default BrandProductsPage;