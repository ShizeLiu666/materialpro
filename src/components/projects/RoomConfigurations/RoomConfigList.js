import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  CardTitle,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
} from "reactstrap";
import { Alert } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import exampleFile from "../../../assets/excel/example.xlsx"; // 参考文件路径
import { API_development_environment } from "../../../config";

const RoomConfigList = ({ roomTypeName }) => {
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21));
  }, [jsonResult]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const fileType = selectedFile?.type;

    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "application/vnd.ms-excel"
    ) {
      setErrorMessage("Only Excel files are accepted. Please upload a valid Excel file.");
      setFile(null);
    } else {
      setFile(selectedFile);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_development_environment}/api/excelToJson/convert`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setJsonResult(JSON.stringify(response.data, null, 2));
      setLoading(false);
    } catch (error) {
      setErrorMessage("There was an error processing the file.");
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (jsonResult) {
      navigator.clipboard.writeText(jsonResult);
      setSuccessMessage("JSON content copied to clipboard.");
      setTimeout(() => {
        setSuccessMessage(""); // 清除成功消息
      }, 3000);
    }
  };

  const handleDownload = () => {
    if (jsonResult) {
      const blob = new Blob([jsonResult], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "JSON format.json";
      link.click();
    }
  };

  return (
    <Row>
      <Col>
        <Card>
          <CardTitle tag="h5" className="border-bottom p-3 mb-0">
            {roomTypeName}
          </CardTitle>
          {errorMessage && (
            <Alert
              variant="outlined"
              severity="error"
              style={{ marginTop: "20px" }}
            >
              {errorMessage}
            </Alert>
          )}
          <CardBody>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  id="exampleFile"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                />
                <FormText>
                  * Only Excel files are accepted, and they must meet specific
                  configuration requirements
                  <br /> * Please refer to the{" "}
                  <a
                    href={exampleFile}
                    download="Example_Configuration_Details.xlsx"
                  >
                    Example of Configuration Details from GPO ES room
                  </a>
                </FormText>
              </FormGroup>
              <Button
                style={{ marginBottom: "20px" }}
                type="submit"
                disabled={!file}
              >
                Submit
              </Button>
              {loading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <CircularProgress style={{ color: "#fbcd0b" }} />
                </Box>
              )}
              <FormGroup>
                <Label for="exampleText">JSON Text Area</Label>
                {successMessage && (
                <Alert
                  variant="outlined"
                  severity="success"
                  className="alert-slide-down"
                  style={{marginBottom: "10px"  }}
                >
                  {successMessage}
                </Alert>
              )}
                <Input
                  id="exampleText"
                  name="text"
                  type="textarea"
                  value={jsonResult}
                  onChange={(e) => setJsonResult(e.target.value)} // Allow user to edit content
                  rows={rows}
                />
              </FormGroup>
              <Button
                style={{ marginBottom: "20px" }}
                onClick={handleCopy}
                disabled={!jsonResult}
              >
                Copy
              </Button>{" "}
              <Button
                style={{ marginBottom: "20px" }}
                onClick={handleDownload}
                disabled={!jsonResult}
              >
                Download
              </Button>{" "}
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default RoomConfigList;

// import React, { useState, useEffect } from "react";
// import { Typography, Box, IconButton, CircularProgress, Button } from "@mui/material";
// import RoomConfigElement from "./RoomConfigElement";
// import UploadRoomConfigModal from "./UploadRoomConfigModal";
// import DeleteRoomConfigModal from "./DeleteRoomConfigModal"; // 导入删除模态框组件
// // import axios from "axios";
// import axiosInstance, { API_development_environment } from "../../../config";
// import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
// import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

// const RoomConfigList = ({ projectId, roomTypeId, roomTypeName }) => {
//   const [expanded, setExpanded] = useState(true);
//   const [config, setConfig] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 控制删除模态框的状态
//   const [buttonText, setButtonText] = useState("UPLOAD CONFIG");

//   useEffect(() => {
//     const fetchConfig = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         if (!token) {
//           console.error("No token found, please log in again.");
//           return;
//         }

//         const response = await axiosInstance.get(
//           `${API_development_environment}/api/config/${projectId}/${roomTypeId}/files`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         console.log("Received config data:", response.data);
//         if (response.data && response.data.length > 0) {
//           setConfig(response.data[0]);
//           setButtonText("UPDATE CONFIG");
//         } else {
//           setButtonText("UPLOAD CONFIG");
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching config:", error);
//         setLoading(false);
//       }
//     };

//     fetchConfig();
//   }, [projectId, roomTypeId]);

//   if (loading) {
//     return <CircularProgress />;
//   }

//   const toggleExpandAll = () => {
//     setExpanded((prevExpanded) => !prevExpanded);
//   };

//   const toggleUploadModal = () => {
//     setUploadModalOpen(!uploadModalOpen);
//   };

//   const toggleDeleteModal = () => {
//     setDeleteModalOpen(!deleteModalOpen); // 切换删除模态框的显示状态
//   };

//   const handleDelete = () => {
//     // 在这里执行删除操作
//     console.log("Delete operation triggered");
//     toggleDeleteModal(); // 关闭模态框
//   };

//   return (
//     <Box>
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 2,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center" }}>
//           <Typography variant="h5" gutterBottom sx={{ marginRight: "5px", marginBottom: "3px"}}>
//             {roomTypeName}
//           </Typography>
//           <IconButton onClick={toggleExpandAll}>
//             {expanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
//           </IconButton>
//         </Box>
//         <Box>
//           <Button
//             onClick={toggleUploadModal}
//             color="primary"
//             size="sm"
//             style={{
//               backgroundColor: "#fbcd0b",
//               borderColor: "#fbcd0b",
//               fontWeight: "bold",
//               color: "#fff",
//               marginRight: "10px",
//             }}
//           >
//             {buttonText}
//           </Button>
//           <Button 
//             onClick={toggleDeleteModal}
//             color="primary"
//             size="sm"
//             style={{ 
//               backgroundColor: "#dc3545", 
//               borderColor: "#dc3545", 
//               fontWeight: "bold", 
//               color: "#fff",
//             }}
//           >
//             Delete
//           </Button>
//         </Box>
//       </Box>
//       <RoomConfigElement config={config} expandAll={expanded} />
//       <UploadRoomConfigModal 
//         isOpen={uploadModalOpen} 
//         toggle={toggleUploadModal} 
//         projectId={projectId} 
//         roomTypeId={roomTypeId} 
//       />
//       <DeleteRoomConfigModal 
//         isOpen={deleteModalOpen} 
//         toggle={toggleDeleteModal} 
//         onDelete={handleDelete} 
//       />
//     </Box>
//   );
// };

// export default RoomConfigList;