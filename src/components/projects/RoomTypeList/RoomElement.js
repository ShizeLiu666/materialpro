import React from 'react';
import { styled } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const RoomElement = ({ primaryText, secondaryText, icon, onDelete, onEdit, onClick }) => {
  return (
    <Demo>
      <ListItemButton
        onClick={onClick} // 添加点击事件处理器
        sx={{
          '&:hover': {
            backgroundColor: '#f0f0f0', // 设置悬停效果
            cursor: 'pointer',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar>
            {icon || <FolderIcon />} {/* 默认使用 FolderIcon */}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText}
        />
        <IconButton edge="end" style={{ marginRight: "5px" }} aria-label="edit" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <EditIcon />
        </IconButton>
        <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <DeleteIcon />
        </IconButton>
      </ListItemButton>
    </Demo>
  );
};

export default RoomElement;