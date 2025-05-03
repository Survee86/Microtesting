import React from 'react';
import { Container, Typography } from '@mui/material';
import TeamSlider from '../../components/TeamSlider/TeamSlider';

const Team = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center">
        Наша команда
      </Typography>
      <TeamSlider />
    </Container>
  );
};

export default Team;