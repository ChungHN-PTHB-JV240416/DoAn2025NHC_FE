import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Button, Input, Space, Typography, Tag, Modal, App, Tooltip, ConfigProvider, theme } from 'antd';
import { DeleteOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useOutletContext } from 'react-router-dom';

// Import slice action (Giữ nguyên đường dẫn của bạn)
import { fetchComments, addReply, deleteComment } from '../../../redux/reducers/CommentSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useToken } = theme;

const AdminCommentsContent = () => {
  const { isDarkMode } = useOutletContext();
  const { token } = useToken();
  const { modal } = App.useApp();
  const dispatch = useDispatch();
  
  // Lấy dữ liệu từ Redux store
  const { comments, loading } = useSelector((state) => state.comments);

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  const handleOpenReply = (record) => {
    setCurrentComment(record);
    setReplyText('');
    setReplyModalVisible(true);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
        toast.warning('Vui lòng nhập nội dung!');
        return;
    }
    
    // Lấy ID an toàn (ưu tiên commentId, nếu không có thì lấy id)
    const commentId = currentComment?.commentId || currentComment?.id;

    if (!commentId) {
        toast.error('Không tìm thấy ID bình luận!');
        return;
    }

    dispatch(addReply({ commentId: commentId, content: replyText }))
        .unwrap()
        .then(() => {
            toast.success('Đã gửi phản hồi!');
            setReplyModalVisible(false);
            dispatch(fetchComments()); // Refresh lại list
        })
        .catch((err) => toast.error(err || 'Lỗi gửi phản hồi'));
  };

  const handleDelete = (id) => {
    modal.confirm({
        title: 'Xóa bình luận',
        content: 'Bạn có chắc muốn xóa bình luận này không?',
        okType: 'danger',
        onOk: () => {
            dispatch(deleteComment(id))
                .unwrap()
                .then(() => toast.success('Đã xóa bình luận'))
                .catch(err => toast.error(err));
        }
    });
  };

  // Lọc comment (Thêm (comments || []) để tránh lỗi nếu comments bị null)
  const filteredComments = (comments || []).filter(c => 
    (c.content && c.content.toLowerCase().includes(searchText.toLowerCase())) || 
    (c.userName && c.userName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: '#', render: (t, r, i) => i + 1, width: 50, align: 'center' },
    { title: 'Người dùng', dataIndex: 'userName', key: 'userName', render: (text) => <Text strong>{text}</Text> },
    { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName', render: (text) => <Tag color="blue">{text || 'SP ID'}</Tag> },
    { title: 'Nội dung', dataIndex: 'content', key: 'content', width: '40%' },
    { title: 'Thời gian', dataIndex: 'createdAt', render: (date) => moment(date).format('DD/MM/YYYY HH:mm') },
    { title: 'Trạng thái', key: 'status', render: (_, record) => record.reply ? <Tag color="success">Đã trả lời</Tag> : <Tag color="warning">Chưa trả lời</Tag> },
    {
        title: 'Thao tác',
        align: 'center',
        render: (_, record) => {
            // Lấy ID an toàn cho từng dòng
            const recordId = record.commentId || record.id;
            return (
                <Space>
                    {!record.reply && (
                        <Tooltip title="Trả lời">
                            <Button type="primary" icon={<MessageOutlined />} size="small" onClick={() => handleOpenReply(record)} />
                        </Tooltip>
                    )}
                    <Tooltip title="Xóa">
                        <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(recordId)} />
                    </Tooltip>
                </Space>
            );
        }
    }
  ];

  return (
    <div style={{ padding: 24 }}>
        <Card 
            variant="borderless" 
            className="shadow-sm"
            style={{ borderRadius: token.borderRadiusLG, boxShadow: token.boxShadow }}
            styles={{
                header: {
                    background: isDarkMode ? '#1f1f1f' : '#1a73e8',
                    color: '#fff',
                    borderTopLeftRadius: token.borderRadiusLG,
                    borderTopRightRadius: token.borderRadiusLG,
                }
            }}
            title={<span style={{color: '#fff'}}>Quản lý Bình Luận</span>}
        >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <Input 
                    placeholder="Tìm nội dung, người dùng..." 
                    prefix={<SearchOutlined />} 
                    style={{ width: 300 }}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            <Table 
                columns={columns} 
                dataSource={filteredComments} 
                // [FIX LỖI KEY]: Tự động lấy commentId hoặc id làm key
                rowKey={(record) => record.commentId || record.id || Math.random()} 
                loading={loading}
                pagination={{ pageSize: 6 }}
                expandable={{
                    expandedRowRender: (record) => (
                        record.reply ? (
                            <div style={{ padding: '10px 20px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                                <Text strong style={{ color: '#389e0d' }}>QTV {record.reply.adminName} trả lời:</Text>
                                <p style={{ margin: 0 }}>{record.reply.content}</p>
                                <div style={{ fontSize: 12, color: '#888', marginTop: 5 }}>
                                    {moment(record.reply.createdAt).format('DD/MM/YYYY HH:mm')}
                                </div>
                            </div>
                        ) : null
                    ),
                    rowExpandable: (record) => !!record.reply,
                }}
            />
        </Card>

        {/* MODAL TRẢ LỜI */}
        <Modal
            title={`Trả lời bình luận của ${currentComment?.userName}`}
            open={replyModalVisible}
            onCancel={() => setReplyModalVisible(false)}
            onOk={handleSubmitReply}
            okText="Gửi phản hồi"
            cancelText="Hủy"
        >
            <div style={{ marginBottom: 10, fontStyle: 'italic', color: '#666' }}>
                "{currentComment?.content}"
            </div>
            <TextArea 
                rows={4} 
                placeholder="Nhập nội dung trả lời..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
            />
        </Modal>
    </div>
  );
};

const AdminComments = () => {
    return (
        <ConfigProvider>
            <App>
                <AdminCommentsContent />
            </App>
        </ConfigProvider>
    );
};

export default AdminComments;