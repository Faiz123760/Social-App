import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Send,
  Person
} from '@mui/icons-material';
import api from '../services/api';
import InfiniteScroll from 'react-infinite-scroll-component';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await api.get(`/api/posts?page=${pageNum}&limit=10`);
      
      if (response.data.success) {
        if (pageNum === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data.posts]);
        }
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handleLike = async (postId) => {
  // Validate postId format (MongoDB ID is 24 hex characters)
  if (!postId || postId.length !== 24) {
    console.error('Invalid post ID:', postId);
    return;
  }
  
  try {
    const response = await api.post(`/api/posts/${postId}/like`, {});
    
    if (response.data.success) {
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: response.data.likes }
          : post
      ));
    }
  } catch (error) {
    console.error('Error liking post:', error);
  }
};

  const handleComment = async (postId) => {
    if (!commentText[postId] || commentText[postId].trim() === '') return;
    
    try {
      const response = await api.post(`/api/posts/${postId}/comment`, {
        text: commentText[postId]
      });
      
      if (response.data.success) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        ));
        setCommentText({ ...commentText, [postId]: '' });
      }
    } catch (error) {
      console.error('Error commenting:', error);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const isLiked = (post) => {
    return post.likes.some(like => like.userId === user?.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, margin: '0 auto' }}>
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        }
        endMessage={
          <Typography align="center" color="textSecondary" sx={{ p: 3 }}>
            🎉 You've seen all posts!
          </Typography>
        }
      >
        {posts.map((post) => (
          <Card key={post._id} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <CardContent>
              {/* User Info */}
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: '#764ba2', mr: 2 }}>
                  {post.username?.[0]?.toUpperCase() || <Person />}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.username}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              
              {/* Post Content */}
              {post.text && (
                <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                  {post.text}
                </Typography>
              )}
              
              {/* Post Image */}
              {post.imageUrl && (
                <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
                  <img 
                    src={post.imageUrl} 
                    alt="Post content" 
                    style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }}
                  />
                </Box>
              )}
              
              {/* Like & Comment Buttons */}
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <IconButton onClick={() => handleLike(post._id)} color={isLiked(post) ? 'error' : 'default'}>
                  {isLiked(post) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
                </Typography>
                
                <IconButton onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}>
                  <Comment />
                </IconButton>
                <Typography variant="body2" color="textSecondary">
                  {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1.5 }} />
              
              {/* Comment Input */}
              <Box display="flex" gap={1} mt={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Write a comment..."
                  value={commentText[post._id] || ''}
                  onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <IconButton 
                  onClick={() => handleComment(post._id)} 
                  color="primary"
                  disabled={!commentText[post._id]?.trim()}
                >
                  <Send />
                </IconButton>
              </Box>
              
              {/* Comments List */}
              {showComments[post._id] && post.comments.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Comments
                  </Typography>
                  {post.comments.map((comment, idx) => (
                    <Box key={idx} mb={1.5} p={1.5} bgcolor="#f5f5f5" borderRadius={2}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {comment.username}
                      </Typography>
                      <Typography variant="body2">{comment.text}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </InfiniteScroll>
    </Box>
  );
};

export default Feed;