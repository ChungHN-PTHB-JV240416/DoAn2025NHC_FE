import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Select, Button, Typography, Space, Modal, Card, Descriptions, Input } from 'antd';
import { toast } from 'react-toastify';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { fetchAllOrders, fetchOrderDetail, updateOrderStatus, setCurrentPage, setPageSize, setSearchText, setStatusFilter, clearSelectedOrder } from '../../../redux/reducers/OrderSlice';

// Giữ nguyên phần import pdfMake của bạn
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts; 

const { Title } = Typography;
const { Option } = Select;

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, totalOrders, selectedOrder, loading, currentPage, pageSize } = useSelector((state) => state.orders);
  const statusOptions = ['WAITING', 'CONFIRM', 'DELIVERY', 'SUCCESS', 'CANCEL'];

  useEffect(() => {
    dispatch(fetchAllOrders({ page: currentPage - 1, size: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleStatusChange = (id, status) => {
    dispatch(updateOrderStatus({ orderId: id, status })).then((res) => {
        if(res.meta.requestStatus === 'fulfilled') toast.success('Đã cập nhật trạng thái');
    });
  };

  // Logic PDF giữ nguyên (đã rút gọn cho ngắn theo code bạn gửi)
  const generatePDF = () => { /* ... Code PDF cũ của bạn ... */ };

  const columns = [
    { title: '#', render: (_, __, i) => (currentPage - 1) * pageSize + i + 1, width: 50, align: 'center' },
    { title: 'Mã đơn', dataIndex: 'serialNumber', fontWeight: 'bold' },
    { title: 'Khách hàng', dataIndex: 'receiveName' },
    { title: 'SĐT', dataIndex: 'receivePhone' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', render: (v) => <span style={{color: '#d32f2f', fontWeight: 'bold'}}>{v?.toLocaleString()} đ</span> },
    { 
        title: 'Trạng thái', 
        dataIndex: 'status', 
        render: (status, record) => (
            <Select 
                defaultValue={status} 
                style={{ width: 120 }} 
                onChange={(val) => handleStatusChange(record.orderId, val)}
                status={status === 'CANCEL' ? 'error' : ''}
            >
                {statusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
        )
    },
    { title: 'Ngày đặt', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    {
      title: '',
      render: (_, record) => <Button size="small" onClick={() => dispatch(fetchOrderDetail(record.orderId))}>Chi tiết</Button>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Đã sửa lỗi: Thay bordered={false} bằng variant="borderless" */}
      <Card variant="borderless" className="shadow-sm" style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <Title level={3} style={{ margin: 0 }}>Quản lý Đơn Hàng</Title>
            <Space>
                <Input placeholder="Tìm đơn hàng..." prefix={<SearchOutlined />} onChange={e => dispatch(setSearchText(e.target.value))} />
                <Select placeholder="Trạng thái" style={{ width: 150 }} onChange={val => dispatch(setStatusFilter(val))} allowClear>
                    {statusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
            </Space>
        </div>

        <Table
            loading={loading}
            columns={columns}
            dataSource={orders}
            rowKey="orderId"
            pagination={{
                current: currentPage,
                pageSize,
                total: totalOrders,
                onChange: (p, s) => { dispatch(setCurrentPage(p)); dispatch(setPageSize(s)); }
            }}
        />
      </Card>

      {/* DETAIL MODAL */}
      <Modal
        title="Thông tin đơn hàng"
        open={!!selectedOrder}
        onCancel={() => dispatch(clearSelectedOrder())}
        width={900}
        footer={[
            <Button key="pdf" icon={<FilePdfOutlined />} onClick={generatePDF}>Xuất PDF</Button>,
            <Button key="close" type="primary" onClick={() => dispatch(clearSelectedOrder())}>Đóng</Button>
        ]}
      >
        {selectedOrder && (
            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <Descriptions title="Thông tin chung" column={1} size="small" bordered>
                        <Descriptions.Item label="Mã đơn">{selectedOrder.serialNumber}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{selectedOrder.receiveName}</Descriptions.Item>
                        <Descriptions.Item label="SĐT">{selectedOrder.receivePhone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedOrder.receiveAddress}</Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">{selectedOrder.note}</Descriptions.Item>
                    </Descriptions>
                </div>
                <div style={{ flex: 1.5 }}>
                    <Typography.Text strong>Danh sách sản phẩm</Typography.Text>
                    <Table 
                        dataSource={selectedOrder.items}
                        pagination={false}
                        size="small"
                        rowKey="id"
                        columns={[
                            { title: 'Sản phẩm', dataIndex: 'productName' },
                            { title: 'SL', dataIndex: 'orderQuantity', align: 'center' },
                            { title: 'Giá', dataIndex: 'unitPrice', render: v => v?.toLocaleString() },
                            { title: 'Thành tiền', render: (_, r) => (r.unitPrice * r.orderQuantity).toLocaleString() }
                        ]}
                        summary={pageData => {
                            return (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={3} align="right"><strong>Tổng cộng:</strong></Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}><strong>{selectedOrder.totalPrice?.toLocaleString()} đ</strong></Table.Summary.Cell>
                                </Table.Summary.Row>
                            );
                        }}
                    />
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;