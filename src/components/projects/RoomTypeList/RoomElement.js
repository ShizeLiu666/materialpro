import React from 'react';
import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // 导入编辑图标

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const RoomElement = ({ primaryText, secondaryText, icon, onDelete, onEdit }) => {
  return (
    <Demo>
      <ListItem
        secondaryAction={
          <>
            <IconButton edge="end" aria-label="edit" onClick={onEdit} style={{marginRight:'5px'}}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </>
        }
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
      </ListItem>
    </Demo>
  );
};

export default RoomElement;