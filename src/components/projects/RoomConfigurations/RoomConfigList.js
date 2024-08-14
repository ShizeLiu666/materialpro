import React, { useState, useEffect } from "react";
import { Typography, Box, IconButton, CircularProgress } from "@mui/material";
import RoomConfigElement from "./RoomConfigElement";
import axios from "axios";
import { API_development_environment } from "../../../config";
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const RoomConfigList = ({ projectId, roomTypeId, roomTypeName }) => {
  const [expanded, setExpanded] = useState(true);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 2, // Add some margin to the bottom for better spacing
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ marginRight: "5px", marginBottom: "3px"}}>
          {roomTypeName}
        </Typography>
        <IconButton onClick={toggleExpandAll}>
          {expanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
        </IconButton>
      </Box>
      <RoomConfigElement config={config} expandAll={expanded} />
    </Box>
  );
};

export default RoomConfigList;
