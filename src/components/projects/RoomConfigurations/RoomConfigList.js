import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Button,
} from "@mui/material";
import RoomConfigElement from "./RoomConfigElement";
import UploadRoomConfigModal from "./UploadRoomConfigModal"; // Import the new component
import axios from "axios";
import { API_development_environment } from "../../../config";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const RoomConfigList = ({ projectId, roomTypeId, roomTypeName }) => {
  const [expanded, setExpanded] = useState(true);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // State to control modal visibility

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
        setConfig(response.data[0]); // Access the first element if response is an array
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

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2, // Add some margin to the bottom for better spacing
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ marginRight: "5px", marginBottom: "3px" }}
          >
            {roomTypeName}
          </Typography>
          <IconButton onClick={toggleExpandAll}>
            {expanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
          </IconButton>
        </Box>
        <Button
          onClick={toggleUploadModal}
          style={{
            backgroundColor: "#fbcd0b",
            color: "#fff",
            fontWeight: "bold",
            marginBottom: "5px", // 确保和 Create Room Type 按钮一致
          }}
          size="small"
        >
          UPLOAD CONFIG
        </Button>
      </Box>
      <RoomConfigElement config={config} expandAll={expanded} />
      <UploadRoomConfigModal
        isOpen={uploadModalOpen}
        toggle={toggleUploadModal}
        projectId={projectId}
        roomTypeId={roomTypeId}
      />
    </Box>
  );
};

export default RoomConfigList;
