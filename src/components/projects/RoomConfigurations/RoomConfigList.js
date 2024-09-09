import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
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
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { Alert } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import BrowserUpdatedIcon from "@mui/icons-material/BrowserUpdated";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Import VisibilityIcon
import exampleFile from "../../../assets/excel/example.xlsx";
import DeleteRoomConfigModal from "./DeleteRoomConfigModal";
import ReplaceRoomConfigModal from "./ReplaceRoomConfigModal";
import {
  processExcelToJson,
  splitJsonFile,
  resetDeviceNameToType,
} from "./ExcelProcessor/ExcelProcessor";
import { validateExcel } from "./ExcelProcessor/validation/main";

const RoomConfigList = ({ roomTypeName, projectRoomId }) => {
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState("");
  const [errorMessage, setErrorMessage] = useState([]); // 使用数组来存储错误信息
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [config, setConfig] = useState(null); // 用于存储现有的config
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 控制删除模态框的开关
  const [alert, setAlert] = useState({
    open: false,
    severity: "",
    message: "",
  });
  const [previewModalOpen, setPreviewModalOpen] = useState(false); // Control preview modal
  const [replaceModalOpen, setReplaceModalOpen] = useState(false); // Control replace confirmation modal

  // Toggle for Preview Modal
  const togglePreviewModal = () => setPreviewModalOpen(!previewModalOpen);

  // Toggle for Replace Confirmation Modal
  const toggleReplaceModal = () => setReplaceModalOpen(!replaceModalOpen);

  // 获取 room 的详细信息，包括 config
  const fetchRoomDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/detail/${projectRoomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        setConfig(data.data.config);
      } else {
        setErrorMessage([`Error fetching room details: ${data.errorMsg}`]);
      }
    } catch (error) {
      setErrorMessage(["Error fetching room details."]);
    }
  }, [projectRoomId]);

  useEffect(() => {
    fetchRoomDetail();
  }, [projectRoomId, fetchRoomDetail]); // Include fetchRoomDetail in the dependency array

  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21));
  }, [jsonResult]);

  const handleDeleteConfig = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/clear-config/${projectRoomId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setConfig(null); // 假设删除成功后将config设置为空
        setAlert({
          severity: "success",
          message: "Room configuration deleted successfully.",
          open: true,
        });
        // Clear the JSON text area and the selected file after successful deletion
        setJsonResult("");
        setFile(null);
        document.getElementById("exampleFile").value = null;
      } else {
        const errorData = await response.json();
        setAlert({
          severity: "error",
          message: `Error deleting room configuration: ${errorData.errorMsg}`,
          open: true,
        });
      }

      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while deleting the room configuration.",
        open: true,
      });
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }

    setDeleteModalOpen(false); // 关闭模态框
  };

  const handleCheckExcelFormat = (event) => {
    event.preventDefault();
    if (!file) {
      setAlert({
        severity: "error",
        message: "Please select a file first.",
        open: true,
      });
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const validationResult = validateExcel(data);
      if (validationResult.length > 0) {
        setErrorMessage(validationResult); // Display validation errors
      } else {
        setErrorMessage([]); // Clear errors
        setAlert({
          severity: "success",
          message: "Validation passed with no errors.",
          open: true,
        });

        setTimeout(() => {
          setAlert({ open: false });
        }, 3000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const fileType = selectedFile?.type;
    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "application/vnd.ms-excel"
    ) {
      setErrorMessage([
        "Only Excel files are accepted. Please upload a valid Excel file.",
      ]);
      setFile(null);
      document.getElementById("exampleFile").value = null;
    } else {
      setFile(selectedFile);
      setErrorMessage([]); // 清空错误信息
    }
  };

  const handleConvertToJson = (event) => {
    event.preventDefault();
    if (!file) {
      setAlert({
        severity: "error",
        message: "Please select a file first.",
        open: true,
      });
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
      return;
    }
    resetDeviceNameToType();
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const allTextData = processExcelToJson(data);
      setLoading(true);
      if (allTextData) {
        const result = splitJsonFile(allTextData);
        setJsonResult(JSON.stringify(result, null, 2));
      } else {
        setErrorMessage(["No matching worksheets found"]);
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmitJson = () => {
    // If a config already exists, confirm replacement
    if (config && Object.keys(config).length > 0) {
      toggleReplaceModal(); // Show replace confirmation modal
    } else {
      submitJson(); // Directly submit if no config exists
    }
  };

  const submitJson = async (isReplace = false) => {
    if (!jsonResult) {
      setErrorMessage(["JSON content is empty"]);
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/${projectRoomId}/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: jsonResult,
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlert({
            severity: "success",
            message: isReplace
              ? "Configuration replaced successfully."
              : "JSON configuration submitted successfully.",
            open: true,
          });
          // Clear the JSON text area and the selected file after successful submission
          setJsonResult("");
          setFile(null);
  
          // Reset the file input value to clear the file name
          document.getElementById("exampleFile").value = null;
  
          // Fetch updated room configuration after successful submission
          fetchRoomDetail(); // Refresh the room config without reloading the whole page
  
          // Close replace modal if it was opened
          if (isReplace) {
            toggleReplaceModal();
          }
        } else {
          setErrorMessage([
            `Failed to submit JSON configuration: ${data.errorMsg}`,
          ]);
        }
      } else {
        setErrorMessage(["Failed to submit JSON configuration"]);
      }
  
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    } catch (error) {
      setErrorMessage(["An error occurred while submitting JSON"]);
    }
  };
  

  // 下载已有 config 文件的函数
  const handleDownloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${roomTypeName}.json`;
    link.click();
  };

  // 下载转换后的 JSON 文件
  const handleDownloadConvertedJson = () => {
    if (jsonResult && file) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const blob = new Blob([jsonResult], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}_converted.json`;
      link.click();
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    // Clear the file input field by accessing the DOM element directly
    document.getElementById("exampleFile").value = null;
  };

  return (
    <Row>
      {/* Alert Component */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        >
          {alert.message}
        </Alert>
      )}

      <Col>
        <Card>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="border-bottom p-3 mb-0"
          >
            <CardTitle tag="h5">
              {roomTypeName}
              {config && config !== "{}" && Object.keys(config).length > 0 && (
                <VisibilityIcon
                  onClick={togglePreviewModal}
                  style={{
                    color: "#1e88e7",
                    cursor: "pointer",
                    marginLeft: "12px",
                  }}
                  fontSize="medium"
                />
              )}
            </CardTitle>

            {config && config !== "{}" && Object.keys(config).length > 0 && (
              <Box display="flex" alignItems="center">
                <BrowserUpdatedIcon
                  onClick={handleDownloadConfig}
                  style={{
                    color: "#4CD3AA",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  fontSize="large"
                />
                <DeleteForeverIcon
                  onClick={() => setDeleteModalOpen(true)}
                  style={{
                    color: "#F44336",
                    cursor: "pointer",
                  }}
                  fontSize="large"
                />
              </Box>
            )}
          </Box>

          {/* 错误提示 */}
          {errorMessage.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <Alert severity="warning" onClose={() => setErrorMessage([])}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: errorMessage.join("<br>"),
                  }}
                />
              </Alert>
            </div>
          )}

          <CardBody>
            <Form onSubmit={handleConvertToJson}>
              <FormGroup
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Input
                  id="exampleFile"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  style={{ flexGrow: 1 }}
                />
                {file && (
                  <Button
                    onClick={clearSelectedFile}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    Remove
                  </Button>
                )}
              </FormGroup>
              <FormText>
                <span style={{ color: "red" }}>*</span> Only Excel files are
                accepted, and they must meet specific configuration
                requirements.
                <br />
                <span style={{ color: "red" }}>*</span> Please refer to the{" "}
                <a
                  href={exampleFile}
                  download="Example_Configuration_Details.xlsx"
                >
                  Example of Configuration Details from GPO ES room
                </a>
              </FormText>
              {/* Separate the buttons into a new section after the FormText */}
              <Box style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <Button
                  style={{ marginBottom: "20px" }}
                  onClick={handleCheckExcelFormat}
                  disabled={!file}
                >
                  Check Excel Format
                </Button>
                <Button
                  type="submit"
                  style={{ marginBottom: "20px" }}
                  disabled={!file}
                >
                  Convert to JSON
                </Button>
              </Box>
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
                <Input
                  id="exampleText"
                  name="text"
                  type="textarea"
                  value={jsonResult}
                  onChange={(e) => setJsonResult(e.target.value)}
                  rows={rows}
                />
              </FormGroup>
              <Button onClick={handleSubmitJson} disabled={!jsonResult}>
                {config && Object.keys(config).length > 0
                  ? "Replace Configuration"
                  : "Submit"}
              </Button>{" "}
              <Button
                onClick={handleDownloadConvertedJson}
                disabled={!jsonResult}
              >
                Download Converted JSON
              </Button>
            </Form>
          </CardBody>
        </Card>

        {/* 删除模态框 */}
        <DeleteRoomConfigModal
          isOpen={deleteModalOpen}
          toggle={() => setDeleteModalOpen(!deleteModalOpen)}
          onDelete={handleDeleteConfig}
        />
      </Col>

      {/* Preview Modal */}
      <Modal isOpen={previewModalOpen} toggle={togglePreviewModal}>
        <ModalHeader toggle={togglePreviewModal}>
          Room Configuration Preview
        </ModalHeader>
        <ModalBody>
          <pre>{JSON.stringify(config, null, 2)}</pre>
        </ModalBody>
      </Modal>

      {/* Replace Configuration Confirmation Modal */}
      <ReplaceRoomConfigModal
        isOpen={replaceModalOpen}
        toggle={toggleReplaceModal}
        onReplace={() => submitJson(true)} // 传递 true 表示是替换操作
      />
    </Row>
  );
};

export default RoomConfigList;