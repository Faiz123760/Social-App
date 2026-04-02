import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  Paper
} from '@mui/material';
import { PhotoCamera, Close, Send } from '@mui/icons-material';
import api from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!text && !image) {
    setError('Please add some text or an image to your post');
    return;
  }
  
  // Add text length validation
  if (text && text.length > 5000) {
    setError('Text is too long. Maximum 5000 characters allowed.');
    return;
  }
  
  setLoading(true);
  setError('');
  
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (image) formData.append('image', image);
  
  try {
    const response = await api.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    if (response.data.success) {
      navigate('/feed');
    }
  } catch (error) {
    setError(error.response?.data?.message || 'Failed to create post');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ maxWidth: 650, width: '100%', borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
            Create New Post
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Share your thoughts with the world
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Share your thoughts, ideas, or experiences..."
              disabled={loading}
            />
            
            {imagePreview && (
              <Box sx={{ position: 'relative', mt: 2, mb: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
                />
                <IconButton
                  onClick={removeImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <Close sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            )}
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCamera />}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Add Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {image && (
                <Typography variant="caption" color="textSecondary">
                  Selected: {image.name}
                </Typography>
              )}
            </Box>
            
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                }
              }}
            >
              {loading ? 'Creating post...' : 'Publish Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreatePost;