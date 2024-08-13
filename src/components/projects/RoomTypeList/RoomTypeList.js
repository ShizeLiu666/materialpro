import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RoomElement from './RoomElement';
import EditRoomTypeModal from './EditRoomTypeModal';
import DeleteRoomTypeModal from './DeleteRoomTypeModal';
import CreateRoomTypeModal from './CreateRoomTypeModal';
import { API_development_environment } from '../../../config';
import { Typography, CircularProgress, Button } from '@mui/material';

const RoomTypeList = ({ projectId, projectName }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        // 获取房间类型列表
        const response = await axios.get(`${API_development_environment}/api/projects/${projectId}/roomTypes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRoomTypes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room types:", error);
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [projectId]);

  const handleCreateRoomType = async (name) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_development_environment}/api/projects/${projectId}/roomTypes`, 
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoomTypes([...roomTypes, response.data]);
    } catch (error) {
      console.error("Error creating room type:", error);
    }
  };

  const handleDeleteRoomType = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`${API_development_environment}/api/projects/${projectId}/roomTypes/delete`, 
        { roomTypeId: selectedRoomType._id }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRoomTypes(prevRoomTypes => prevRoomTypes.filter(roomType => roomType._id !== selectedRoomType._id));
      setDeleteModalOpen(false); // 关闭模态框
    } catch (error) {
      console.error("Error deleting room type:", error);
    }
  };

  const handleEditRoomType = (roomType) => {
    setSelectedRoomType(roomType);
    setEditModalOpen(true);
  };

  const handleSaveRoomType = async (newName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_development_environment}/api/projects/${projectId}/roomTypes/${selectedRoomType._id}`, 
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoomTypes(prevRoomTypes => 
        prevRoomTypes.map(roomType => 
          roomType._id === selectedRoomType._id ? response.data : roomType
        )
      );
    } catch (error) {
      console.error("Error updating room type:", error);
    }
  };

  const handleDeleteClick = (roomType) => {
    setSelectedRoomType(roomType);
    setDeleteModalOpen(true); // 打开模态框
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {projectName}
        </Typography>
        <Button
          onClick={() => setCreateModalOpen(true)}
          style={{ backgroundColor: "#fbcd0b", color: "#fff", fontWeight: "bold" }}
          size="small"
        >
          Create Room Type
        </Button>
      </div>
      {roomTypes.map((roomType) => (
        <RoomElement
          key={roomType._id}
          primaryText={`${roomType.typeCode}`}
          secondaryText={roomType.name}
          onDelete={() => handleDeleteClick(roomType)}
          onEdit={() => handleEditRoomType(roomType)}
        />
      ))}
      {selectedRoomType && (
        <>
          <EditRoomTypeModal
            isOpen={editModalOpen}
            toggle={() => setEditModalOpen(!editModalOpen)}
            currentName={selectedRoomType.name}
            onSave={handleSaveRoomType}
          />
          <DeleteRoomTypeModal
            isOpen={deleteModalOpen}
            toggle={() => setDeleteModalOpen(!deleteModalOpen)}
            onDelete={handleDeleteRoomType}
          />
        </>
      )}
      <CreateRoomTypeModal
        isOpen={createModalOpen}
        toggle={() => setCreateModalOpen(!createModalOpen)}
        onCreate={handleCreateRoomType}
      />
    </div>
  );
};

export default RoomTypeList;