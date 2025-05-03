import React from 'react';
import { Typography } from '@mui/material';
import './ContentPage.css';

const ContentPage = ({ title }) => {
  return (
    <div className="content-page">
      
      <main className="page-content">
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
      </main>
    </div>
  );
};

export default ContentPage;