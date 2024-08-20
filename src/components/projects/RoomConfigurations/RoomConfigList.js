import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton, CircularProgress, Button } from "@mui/material";
import RoomConfigElement from "./RoomConfigElement";
import UploadRoomConfigModal from "./UploadRoomConfigModal";
import DeleteRoomConfigModal from "./DeleteRoomConfigModal"; // 导入删除模态框组件
import axios from "axios";
import { API_development_environment } from "../../../config";
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const RoomConfigList = ({ projectId, roomTypeId, roomTypeName }) => {
  const [expanded, setExpanded] = useState(true);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 控制删除模态框的状态
  const [buttonText, setButtonText] = useState("UPLOAD CONFIG");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No token found, please log in again.");
          return;
        }

        const response = await axios.get(
          `${API_development_environment}/api/config/${projectId}/${roomTypeId}/files`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Received config data:", response.data);
        if (response.data && response.data.length > 0) {
          setConfig(response.data[0]);
          setButtonText("UPDATE CONFIG");
        } else {
          setButtonText("UPLOAD CONFIG");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching config:", error);
        setLoading(false);
      }
    };

    fetchConfig();
  }, [projectId, roomTypeId]);

  if (loading) {
    return <CircularProgress />;
  }

  const toggleExpandAll = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };

  const toggleUploadModal = () => {
    setUploadModalOpen(!uploadModalOpen);
  };

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!deleteModalOpen); // 切换删除模态框的显示状态
  };

  const handleDelete = () => {
    // 在这里执行删除操作
    console.log("Delete operation triggered");
    toggleDeleteModal(); // 关闭模态框
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" gutterBottom sx={{ marginRight: "5px", marginBottom: "3px"}}>
            {roomTypeName}
          </Typography>
          <IconButton onClick={toggleExpandAll}>
            {expanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          </IconButton>
        </Box>
        <Box>
          <Button
            onClick={toggleUploadModal}
            color="primary"
            size="sm"
            style={{
              backgroundColor: "#fbcd0b",
              borderColor: "#fbcd0b",
              fontWeight: "bold",
              color: "#fff",
              marginRight: "10px",
            }}
          >
            {buttonText}
          </Button>
          <Button 
            onClick={toggleDeleteModal}
            color="primary"
            size="sm"
            style={{ 
              backgroundColor: "#dc3545", 
              borderColor: "#dc3545", 
              fontWeight: "bold", 
              color: "#fff",
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      <RoomConfigElement config={config} expandAll={expanded} />
      <UploadRoomConfigModal 
        isOpen={uploadModalOpen} 
        toggle={toggleUploadModal} 
        projectId={projectId} 
        roomTypeId={roomTypeId} 
      />
      <DeleteRoomConfigModal 
        isOpen={deleteModalOpen} 
        toggle={toggleDeleteModal} 
        onDelete={handleDelete} 
      />
    </Box>
  );
};

export default RoomConfigList;