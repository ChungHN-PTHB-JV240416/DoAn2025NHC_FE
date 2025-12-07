import { useEffect, useState } from 'react';
import { Card, Input, Button, List, Spin, ConfigProvider, Avatar, Typography, Divider } from 'antd';
import { UserOutlined, SendOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import { getToken } from '../../api/index'; // Đảm bảo import đúng
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ProductComments = ({ productId }) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (productId) fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Sửa endpoint theo đúng backend của bạn
      const response = await axios.get(`http://localhost:8080/api/v1/comments/product/${productId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.warning('Vui lòng nhập nội dung bình luận!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/comments',
        { productId, content: newComment },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Bình luận đã được gửi!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Gửi bình luận thất bại! Vui lòng đăng nhập.');
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1a73e8', borderRadius: 8 } }}>
      <div style={{ marginTop: 40 }}>
        <Card bordered={false} className="shadow-sm" title={<Title level={4} style={{ margin: 0 }}>💬 Đánh giá & Hỏi đáp</Title>}>
            
            {/* Input Section */}
            <div style={{ display: 'flex', gap: 15, marginBottom: 30 }}>
                <Avatar size={45} icon={<UserOutlined />} style={{ backgroundColor: '#1a73e8' }} />
                <div style={{ flex: 1 }}>
                    <TextArea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                        style={{ resize: 'none', marginBottom: 10 }}
                    />
                    <div style={{ textAlign: 'right' }}>
                         <Button type="primary" icon={<SendOutlined />} onClick={handleAddComment}>
                            Gửi đánh giá
                         </Button>
                    </div>
                </div>
            </div>

            <Divider />

            {/* List Comments */}
            <Spin spinning={loading} tip="Đang tải bình luận...">
                {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={comments}
                        renderItem={(comment) => (
                            <List.Item style={{ borderBottom: '1px solid #f0f0f0', padding: '15px 0' }}>
                                <div style={{ display: 'flex', gap: 15 }}>
                                    <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>
                                        {comment.userName?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <Text strong>{comment.userName}</Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>{moment(comment.createdAt).format('DD/MM/YYYY - HH:mm')}</Text>
                                        </div>
                                        <div style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '0 12px 12px 12px', display: 'inline-block' }}>
                                            <Text>{comment.content}</Text>
                                        </div>

                                        {/* Admin Reply */}
                                        {comment.reply && (
                                            <div style={{ marginTop: 15, paddingLeft: 15, borderLeft: '3px solid #1a73e8' }}>
                                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                    <Avatar size="small" icon={<SafetyCertificateFilled />} style={{ backgroundColor: '#1a73e8' }} />
                                                    <div>
                                                        <Text strong style={{ color: '#1a73e8' }}>QTV - {comment.reply.adminName}</Text>
                                                        <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
                                                        <Text type="secondary" style={{ fontSize: '11px' }}>{moment(comment.reply.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                                                        <div style={{ marginTop: 5 }}>
                                                            <Text>{comment.reply.content}</Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Spin>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default ProductComments;