import React, { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const RoomConfigElement = ({ config, expandAll }) => {
  console.log("Received config:", config);

  const [expandedSections, setExpandedSections] = useState({
    devices: expandAll,
    groups: expandAll,
    scenes: expandAll,
    remoteControls: expandAll,
  });

  useEffect(() => {
    setExpandedSections({
      devices: expandAll,
      groups: expandAll,
      scenes: expandAll,
      remoteControls: expandAll,
    });
  }, [expandAll]);

  const toggleExpanded = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  const groupDevicesByShortname = (devices) => {
    return devices.reduce((acc, device) => {
      if (!acc[device.appearanceShortname]) {
        acc[device.appearanceShortname] = [];
      }
      acc[device.appearanceShortname].push(device.deviceName);
      return acc;
    }, {});
  };

  const renderDeviceRow = (device, index) => (
    <TableRow key={index}>
      <TableCell>{device.appearanceShortname}</TableCell>
      <TableCell>{device.deviceNames.join(", ")}</TableCell>
    </TableRow>
  );

  const renderSceneRow = (scene, index) => (
    <TableRow key={index}>
      <TableCell>{scene.sceneName}</TableCell>
      <TableCell>
        {scene.contents.map((content) => content.name).join(", ")}
      </TableCell>
    </TableRow>
  );

  const renderRemoteRow = (remote, index) => (
    <TableRow key={index}>
      <TableCell>{remote.remoteName}</TableCell>
      <TableCell>
        {remote.links.map((link) => link.linkName).join(", ") || "No links"}
      </TableCell>
    </TableRow>
  );

  const renderSection = (sectionName, data, renderRow) => (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          padding: "8px 16px",
        }}
        onClick={() => toggleExpanded(sectionName)}
      >
        <Typography variant="h6" gutterBottom>
          {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
        </Typography>
        <IconButton size="small">
          {expandedSections[sectionName] ? (
            <ExpandLessIcon />
          ) : (
            <ExpandMoreIcon />
          )}
        </IconButton>
      </Box>
      {expandedSections[sectionName] && (
        <Box sx={{ padding: "0px 16px 0px 16px" }}>
          {Array.isArray(data) && data.length > 0 ? (
            <Table sx={{ marginBottom: "0px" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{data.map(renderRow)}</TableBody>
            </Table>
          ) : (
            <Typography variant="body2" sx={{ padding: "8px" }}>
              No data
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );

  const groupedDevices = groupDevicesByShortname(config?.config?.devices || []);
  const deviceRows = Object.keys(groupedDevices).map((key, index) => ({
    appearanceShortname: key,
    deviceNames: groupedDevices[key],
  }));

  return (
    <Box>
      {renderSection("devices", deviceRows, renderDeviceRow)}
      {renderSection("groups", config?.config?.groups, () => (
        <TableRow>
          <TableCell colSpan={2}>No specific data for groups</TableCell>
        </TableRow>
      ))}
      {renderSection("scenes", config?.config?.scenes, renderSceneRow)}
      {renderSection("remoteControls", config?.config?.remoteControls, renderRemoteRow)}
    </Box>
  );
};

export default RoomConfigElement;