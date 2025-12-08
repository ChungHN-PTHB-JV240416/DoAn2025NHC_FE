import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Import BASE_URL_ADMIN và getToken từ api
import { BASE_URL_ADMIN, getToken } from '../../api/index'; 

// Hàm helper để tạo header và LOG TOKEN ra kiểm tra
const getAuthHeader = () => {
  const token = getToken();
  
  // [DEBUG]: Bật F12 xem dòng này có in ra chuỗi Token dài ngoằng không?
  // Nếu in ra "Token used: null" hoặc "undefined" nghĩa là bạn chưa lưu token đúng chỗ.
  // console.log("🔑 Token used for Admin API:", token);

  if (!token) return {}; // Trả về rỗng nếu không có token

  return { 
    headers: { Authorization: `Bearer ${token}` } 
  };
};

// 1. ADMIN: Lấy tất cả bình luận
export const fetchComments = createAsyncThunk('comments/fetchComments', async (_, { rejectWithValue }) => {
  try {
    const config = getAuthHeader();
    if (!config.headers) {
        return rejectWithValue("Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!");
    }

    const response = await BASE_URL_ADMIN.get('/comments', config);
    return response.data || [];
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Không thể tải bình luận!');
  }
});

// 2. ADMIN: Trả lời bình luận
export const addReply = createAsyncThunk('comments/addReply', async ({ commentId, content }, { rejectWithValue }) => {
  try {
    const config = getAuthHeader();
    
    // Kiểm tra chặn ngay nếu không có token để tránh gọi API bị 401
    if (!config.headers) {
        console.error("❌ Missing Token!");
        return rejectWithValue("Vui lòng đăng nhập lại (Thiếu Token)!");
    }

    const response = await BASE_URL_ADMIN.post(
        `/comments/${commentId}/reply`, 
        { content }, 
        config // Truyền header vào đây
    );
    return { commentId, reply: response.data };
  } catch (error) {
    // console.error("❌ Lỗi API Reply:", error);
    if (error.response && error.response.status === 401) {
        return rejectWithValue("Phiên đăng nhập hết hạn hoặc bạn không có quyền Admin!");
    }
    return rejectWithValue(error.response?.data?.message || 'Lỗi gửi phản hồi!');
  }
});

// 3. ADMIN: Xóa bình luận
export const deleteComment = createAsyncThunk('comments/deleteComment', async (commentId, { rejectWithValue }) => {
    try {
        const config = getAuthHeader();
        if (!config.headers) return rejectWithValue("Thiếu Token!");

        await BASE_URL_ADMIN.delete(`/comments/${commentId}`, config);
        return commentId;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Lỗi xóa bình luận');
    }
});

const CommentSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addReply.fulfilled, (state, action) => {
        const { commentId, reply } = action.payload;
        state.comments = state.comments.map((comment) => {
            // Mapping linh hoạt cả id lẫn commentId
            const currentId = comment.commentId || comment.id;
            if (currentId === commentId) {
                return { ...comment, reply };
            }
            return comment;
        });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
          state.comments = state.comments.filter(c => (c.commentId || c.id) !== action.payload);
      });
  },
});

export default CommentSlice.reducer;