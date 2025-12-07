import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserId } from '../api/index'; // Lấy userId từ cookies
import { addToWishList, fetchWishList, removeFromWishList } from '../redux/reducers/WishListSlice';
import { FaHeart } from 'react-icons/fa'; // Sử dụng biểu tượng trái tim từ react-icons
import '../styles/CardProduct.scss';

const CardProduct = ({ product, onViewDetail }) => {    
    const dispatch = useDispatch();
    const { wishList, loading } = useSelector((state) => state.wishList);
    const [isInWishList, setIsInWishList] = useState(false);
    const userId = getUserId(); // Lấy userId từ cookies

    useEffect(() => {
        if (userId) {
            dispatch(fetchWishList()); // Lấy danh sách WishList khi component mount
        }
    }, [dispatch, userId]);

    useEffect(() => {
        // Kiểm tra xem sản phẩm có trong WishList không
        const found = wishList.find(item => item.productId === product.productId);
        setIsInWishList(!!found);
    }, [wishList, product.productId]);

    const handleAddToWishList = async () => {
        if (!userId) {
            toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        try {
            if (isInWishList) {
                // Xóa khỏi WishList
                const wishListItem = wishList.find(item => item.productId === product.productId);
                await dispatch(removeFromWishList(wishListItem.wishListId)).unwrap();
                toast.success('Đã xóa khỏi danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            } else {
                // Thêm vào WishList
                await dispatch(addToWishList({ productId: product.productId })).unwrap();
                toast.success('Đã thêm vào danh sách yêu thích!', { position: 'top-right', autoClose: 3000 });
            }
            dispatch(fetchWishList()); // Cập nhật lại danh sách WishList
        } catch (error) {
            toast.error(error || 'Có lỗi xảy ra!', { position: 'top-right', autoClose: 3000 });
        }
    };

    return (
        <Card className="mb-4 shadow-sm border-0 h-100 product-hover-effect">
            <div style={{ padding: '15px', position: 'relative' }}>
                <Card.Img
                    variant="top"
                    src={product.image || 'https://picsum.photos/300?random=1'}
                    alt={product.productName}
                    onError={(e) => (e.target.src = 'https://picsum.photos/300?random=1')}
                    // FIX LỖI ẢNH: Đặt chiều cao cố định và dùng contain
                    style={{ height: '200px', objectFit: 'contain', width: '100%' }} 
                />
                {product.isNew && (
                    <span className="badge bg-danger position-absolute top-0 start-0 m-3">Mới</span>
                )}
            </div>
            <Card.Body className="d-flex flex-column">
                <Card.Title className="text-center fw-bold text-dark text-truncate" title={product.productName}>
                    {product.productName || 'Không có tên'}
                </Card.Title>
                <Card.Text className="text-center text-muted small" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px' }}>
                    {product.description || 'Không có mô tả'}
                </Card.Text>
                <Card.Text className="text-center text-danger fw-bold fs-5 my-2">
                    {product.unitPrice != null ? product.unitPrice.toLocaleString('vi-VN') : 'Liên hệ'} VNĐ
                </Card.Text>
                <div className="mt-auto">
                    <Button variant="primary" className="w-100 mb-2 rounded-pill" onClick={() => onViewDetail(product.productId)}>
                        Xem chi tiết
                    </Button>
                    {userId && (
                        <Button
                            variant={isInWishList ? 'outline-danger' : 'outline-secondary'}
                            className="w-100 d-flex align-items-center justify-content-center rounded-pill"
                            onClick={handleAddToWishList}
                            disabled={loading}
                        >
                            <FaHeart
                                style={{
                                    marginRight: isInWishList ? 0 : '5px', // Không cần margin nếu là "Xóa"
                                    color: isInWishList ? 'red' : 'inherit', // Trái tim đỏ khi đã thêm
                                }}
                            />
                            {isInWishList ? ' Đã yêu thích' : ' Yêu thích'} 
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default CardProduct;