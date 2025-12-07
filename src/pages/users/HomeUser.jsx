import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../api/index';
import { Input, Spin, Card, Row, Col, Button, Typography, Result } from 'antd';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import ProductList from '../../components/ProductList';
import ProductModal from '../../components/ProductModal';
import Banner from '../../components/Banner';
import { addToCart, fetchCartItems } from '../../redux/reducers/CartSlice';
import '../../styles/Home.scss';

const { Title } = Typography;

const STATIC_POSTS = [
  { id: 1, title: "Xây dựng phần mềm bán điện thoại", excerpt: "Tìm hiểu các bước cơ bản...", thumbnail: '/image/webdienthoai.jpg', createdAt: '2025-04-09' },
  { id: 2, title: "Tối ưu hóa trải nghiệm người dùng", excerpt: "Làm thế nào để tạo ra giao diện thân thiện...", thumbnail: '/image/toiuuhoanguoidung.jpg', createdAt: '2025-04-03' },
  { id: 3, title: "Tích hợp thanh toán trực tuyến", excerpt: "Hướng dẫn tích hợp VNPay, MoMo...", thumbnail: '/image/Thumb2-VNpay.jpg', createdAt: '2025-03-29' },
];

const ProductSection = ({ title, color, products, onViewDetail }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="section mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <Title level={3} style={{ margin: 0, borderLeft: `5px solid ${color}`, paddingLeft: 15 }}>{title}</Title>
        <Button type="link">Xem tất cả <ArrowRightOutlined /></Button>
      </div>
      <ProductList products={products} onViewDetail={onViewDetail} />
    </div>
  );
};

const HomeUser = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [data, setData] = useState({ featured: [], newProducts: [], bestSeller: [] });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
        setLoading(true);
        try {
          const [featRes, newRes, bestRes] = await Promise.all([
              BASE_URL.get('/products/featured-products').catch(() => ({ data: [] })), 
              BASE_URL.get('/products/new-products').catch(() => ({ data: [] })),
              BASE_URL.get('/products/best-seller-products').catch(() => ({ data: [] }))
          ]);
          setData({
            featured: featRes.data.content || featRes.data || [],
            newProducts: newRes.data.content || newRes.data || [],
            bestSeller: bestRes.data.content || bestRes.data || [],
          });
        } catch (error) {
          console.error('Error fetching home data:', error);
        } finally {
          setLoading(false);
        }
      };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const debounceTimer = setTimeout(async () => {
        setSearchLoading(true);
        try {
            const response = await BASE_URL.get('/products/search', { params: { keyword: searchQuery } });
            setSearchResults(response.data.content || response.data || []);
        } catch { toast.error('Lỗi tìm kiếm!'); } finally { setSearchLoading(false); }
    }, 700);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleViewDetail = async (productId) => {
    try {
      const response = await BASE_URL.get(`/products/${productId}`);
      setSelectedProduct(response.data);
      setShowModal(true);
    } catch { toast.error('Lỗi tải chi tiết sản phẩm'); }
  };

  const handleAddToCart = async (productId) => {
    if (!user || !user.userId) { toast.info('Vui lòng đăng nhập!'); navigate('/login'); return; }
    try {
      await dispatch(addToCart({ userId: user.userId, requestDTO: { productId, quantity: 1 } })).unwrap();
      toast.success('Đã thêm vào giỏ hàng!');
      dispatch(fetchCartItems(user.userId));
    } catch { toast.error('Lỗi thêm giỏ hàng!'); }
  };

  return (
    <div className="home-content">
      {/* BANNER SECTION:
         - margin-top: 0 để dính liền Header
         - height: auto để component con tự quyết định
      */}
      <div style={{ marginTop: 0, marginBottom: 40, width: '100%', overflow: 'hidden' }}>
         <Banner />
      </div>

      <Spin spinning={loading} tip="Đang tải dữ liệu..." size="large">
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            
            {user?.username && (
              <div className="text-center mb-4">
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>Xin chào, {user.username}!</Title>
              </div>
            )}

            {/* SEARCH */}
            <div style={{ maxWidth: 600, margin: '0 auto 50px' }}>
                <Input placeholder="Bạn muốn tìm điện thoại gì?" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} size="large" prefix={<SearchOutlined />} suffix={searchLoading && <Spin size="small" />} style={{ borderRadius: 30, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} allowClear />
            </div>

            {/* CONTENT */}
            {searchQuery ? (
               <div className="section mb-5">
                 <Title level={3}>Kết quả tìm kiếm "{searchQuery}"</Title>
                 {searchResults.length > 0 ? (
                    <ProductList products={searchResults} onViewDetail={handleViewDetail} />
                 ) : (
                    !searchLoading && <Result status="404" title="Không tìm thấy sản phẩm nào" />
                 )}
               </div>
            ) : (
              <>
                <ProductSection title="Sản phẩm nổi bật" color="#fa8c16" products={data.featured} onViewDetail={handleViewDetail} />
                <ProductSection title="Sản phẩm mới" color="#52c41a" products={data.newProducts} onViewDetail={handleViewDetail} />
                <ProductSection title="Sản phẩm bán chạy" color="#1890ff" products={data.bestSeller} onViewDetail={handleViewDetail} />

                {/* BLOG */}
                <div className="section mb-5">
                   <Title level={3} style={{ margin: '0 0 30px', textAlign: 'center' }}>Tin tức công nghệ</Title>
                   <Row gutter={[24, 24]}>
                       {STATIC_POSTS.map((post) => (
                           <Col md={8} sm={24} key={post.id}>
                               <Card hoverable className="news-card" style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                                   cover={<img alt={post.title} src={post.thumbnail} style={{ height: 200, objectFit: 'cover' }} onError={(e) => e.target.src='https://via.placeholder.com/300?text=No+Image'} />}>
                                   <Card.Meta title={<Link to={`/posts/${post.id}`} style={{ color: '#333' }}>{post.title}</Link>} description={<span className="text-muted small">{post.createdAt}</span>} />
                               </Card>
                           </Col>
                       ))}
                   </Row>
                </div>
              </>
            )}
        </div>
      </Spin>

      <ProductModal showModal={showModal} handleCloseModal={() => setShowModal(false)} selectedProduct={selectedProduct} onAddToCart={handleAddToCart} />
    </div>
  );
};

export default HomeUser;