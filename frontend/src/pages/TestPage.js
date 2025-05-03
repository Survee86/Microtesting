import React, { useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const NumberInputWithChart = () => {
  const [value, setValue] = useState(0);

  const handleChange = (e) => {
    const num = parseFloat(e.target.value) || 0;
    setValue(num);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Введите число и смотрите график
        </Typography>

        <TextField
          label="Число"
          type="number"
          value={value}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box sx={{ height: 400, mt: 3 }}>
          <BarChart
            series={[{ data: [value] }]}
            xAxis={[{ scaleType: 'band', data: ['Значение'] }]}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default NumberInputWithChart;