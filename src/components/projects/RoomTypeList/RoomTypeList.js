import React, { useEffect, useState } from "react";
import axios from "axios";
import RoomElement from "./RoomElement";
import EditRoomTypeModal from "./EditRoomTypeModal";
import DeleteRoomTypeModal from "./DeleteRoomTypeModal";
import CreateRoomTypeModal from "./CreateRoomTypeModal";
// import axiosInstance, { API_development_environment } from "../../../config";
import { Typography, CircularProgress, Button } from "@mui/material";

const RoomTypeList = ({ projectId, projectName, onNavigate }) => {
  // console.log("projectId:", projectId);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        const response = await axios.get(
          `/api/project-rooms/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.success) {
          setRoomTypes(response.data.data); // 直接从 data 里获取房间类型
        } else {
          console.error("Error fetching room types:", response.data.errorMsg);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching room types:", error);
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [projectId]);

  const handleCreateRoomType = async ({ name, typeCode, des, iconUrl }) => {
    const token = localStorage.getItem("authToken");

    // 打印出即将发送的表单数据
    console.log("Form data being sent to backend:", {
        projectId,
        name,
        typeCode,
        des,
        iconUrl,
    });

    try {
      const response = await axios.post(
        "/api/project-rooms",
        {
          projectId,
          name,
          typeCode,
          des,
          iconUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setRoomTypes([...roomTypes, response.data.data]); // 将新创建的房间类型添加到现有列表中
      } else {
        console.error("Error creating room type:", response.data.errorMsg);
      }
    } catch (error) {
      throw error; // 将错误抛出给调用函数
    }
  };

  const handleDeleteRoomType = async () => {
    try {
      const token = localStorage.getItem("authToken");
  
      // 使用 projectRoomId 进行删除请求
      await axios.delete(`/api/project-rooms/${selectedRoomType.projectRoomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // 从 roomTypes 列表中删除该房型
      setRoomTypes((prevRoomTypes) =>
        prevRoomTypes.filter(
          (roomType) => roomType.projectRoomId !== selectedRoomType.projectRoomId
        )
      );
      setDeleteModalOpen(false);  // 关闭删除模态框
    } catch (error) {
      console.error("Error deleting room type:", error);
    }
  };  

  const handleEditRoomType = (roomType) => {
    // setSelectedRoomType(roomType);
    // setEditModalOpen(true);
  };

  const handleSaveRoomType = async (newName) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `/api/projects/${projectId}/roomTypes/${selectedRoomType._id}`,
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoomTypes((prevRoomTypes) =>
        prevRoomTypes.map((roomType) =>
          roomType._id === selectedRoomType._id ? response.data : roomType
        )
      );
    } catch (error) {
      console.error("Error updating room type:", error);
    }
  };

  const handleDeleteClick = (roomType) => {
    setSelectedRoomType(roomType);
    setDeleteModalOpen(true);
  };

  const handleRoomTypeClick = (roomType) => {
    console.log("Selected roomType:", roomType);  // 确保 projectRoomId 正确
    console.log("Selected roomType id:", roomType.projectRoomId);  // 确保 projectRoomId 正确
    onNavigate(
      ["Project List", "Room Types", "Room Configurations"],
      roomType.projectRoomId,
      roomType.name
    );
  };
  
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {projectName}
        </Typography>
        <Button
          color="primary"
          onClick={() => setCreateModalOpen(true)}
          style={{
            backgroundColor: "#fbcd0b",
            color: "#fff",
            fontWeight: "bold",
            marginBottom: "5px",
            textTransform: "none", // 确保文字不变为大写
          }}
        >
          Create Room Type
        </Button>
      </div>
      {roomTypes.map((roomType) => (
        <RoomElement
          key={roomType.projectRoomId}
          primaryText={`${roomType.typeCode}`}
          secondaryText={roomType.name}
          onDelete={() => handleDeleteClick(roomType)}
          onEdit={() => handleEditRoomType(roomType)}
          onClick={() => handleRoomTypeClick(roomType)} // 处理房型点击事件
        />
      ))}
      {selectedRoomType && (
        <>
          <EditRoomTypeModal
            isOpen={editModalOpen}
            toggle={() => setEditModalOpen(!editModalOpen)}
            currentName={selectedRoomType.name}
            onSave={handleSaveRoomType} // 使用定义的handleSaveRoomType
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