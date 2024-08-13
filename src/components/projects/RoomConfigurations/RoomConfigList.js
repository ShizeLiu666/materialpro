import React from 'react';
import { Typography, Box } from '@mui/material';

const RoomConfigList = ({ roomTypeId, roomTypeName }) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {roomTypeName}
      </Typography>
      {/* 在这里你可以添加配置项的内容 */}
      <Typography variant="body1">
        This is the Room Configurations page for {roomTypeName}.
      </Typography>
    </Box>
  );
};

export default RoomConfigList;