import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { StorageService } from '../services/storage';

export const AvatarUploader = ({ userId, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        const file = e.target.files[0];
        const url = await StorageService.uploadAvatar(userId, file);
        onUploadSuccess(url);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="avatar-upload"
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="avatar-upload">
        <Button
          variant="contained"
          color="primary"
          component="span"
          startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={isUploading}
        >
          {isUploading ? 'Загрузка...' : 'Загрузить аватар'}
        </Button>
      </label>
    </div>
  );
};