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
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import exampleFile from "../../../assets/excel/example.xlsx";
import DeleteRoomConfigModal from "./DeleteRoomConfigModal"; // 引入自定义的删除模态框
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
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);
  const [config, setConfig] = useState(null); // 用于存储现有的config
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 控制删除模态框的开关

  // 获取 room 的详细信息，包括 config
  useEffect(() => {
    const fetchRoomDetail = async () => {
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
          setConfig(data.data.config); // 设置config
        } else {
          setErrorMessage([`Error fetching room details: ${data.errorMsg}`]);
        }
      } catch (error) {
        setErrorMessage(["Error fetching room details."]);
      }
    };

    fetchRoomDetail();
  }, [projectRoomId]);

  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21));
  }, [jsonResult]);

  const handleDeleteConfig = async () => {
    // 这里可以添加实际删除配置的逻辑
    setConfig(null); // 假设删除后将config设置为空
    setDeleteModalOpen(false); // 关闭模态框
  };

  const handleCheckExcelFormat = (event) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage(["Please select a file first."]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const validationResult = validateExcel(data);
      if (validationResult.length > 0) {
        setErrorMessage(validationResult); // 直接使用返回的错误消息
      } else {
        setErrorMessage([]); // 清空错误信息
        setSuccessMessage("Validation passed with no errors.");
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
    } else {
      setFile(selectedFile);
      setErrorMessage([]); // 清空错误信息
    }
  };

  const handleConvertToJson = (event) => {
    event.preventDefault();
    if (!file) {
      setErrorMessage(["Please select a file first."]);
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

  const handleSubmitJson = async () => {
    if (!jsonResult) {
      setErrorMessage(["JSON content is empty."]);
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
          setSuccessMessage("JSON configuration submitted successfully.");
        } else {
          setErrorMessage([
            `Failed to submit JSON configuration: ${data.errorMsg}`,
          ]);
        }
      } else {
        setErrorMessage(["Failed to submit JSON configuration."]);
      }

      setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage([]);
      }, 3000);
    } catch (error) {
      setErrorMessage(["An error occurred while submitting JSON."]);
    }
  };

  // 下载已有 config 文件的函数
  const handleDownloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "room_config.json";
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

  return (
    <Row>
      <Col>
        <Card>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="border-bottom p-3 mb-0"
          >
            <CardTitle tag="h5">{roomTypeName}</CardTitle>
            {/* 如果config存在，则显示下载图标和删除图标 */}
            {config && (
              <Box display="flex" alignItems="center">
                <CloudDownloadIcon
                  onClick={handleDownloadConfig}
                  style={{
                    color: "#fbcd0b",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  fontSize="large"
                />
                <DeleteForeverIcon
                  onClick={() => setDeleteModalOpen(true)} // 打开删除模态框
                  style={{
                    // color: "red",
                    cursor: "pointer",
                  }}
                  fontSize="large"
                />
              </Box>
            )}
          </Box>

          {/* 错误提示 */}
          {errorMessage.length > 0 && (
            <Alert severity="warning" onClose={() => setErrorMessage([])}>
              <span
                dangerouslySetInnerHTML={{
                  __html: errorMessage.join("<br>"),
                }}
              />
            </Alert>
          )}

          <CardBody>
            <Form onSubmit={handleConvertToJson}>
              <FormGroup>
                <Input
                  id="exampleFile"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                />
                <FormText>
                  * Only Excel files are accepted, and they must meet specific
                  configuration requirements.
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
                style={{ marginRight: "10px", marginBottom: "20px" }}
                onClick={handleCheckExcelFormat}
                disabled={!file}
              >
                Check Excel Format
              </Button>
              <Button
                type="submit"
                style={{ marginRight: "10px", marginBottom: "20px" }}
                disabled={!file}
              >
                Convert to JSON
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
                    style={{ marginBottom: "10px" }}
                  >
                    {successMessage}
                  </Alert>
                )}
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
                Submit
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
    </Row>
  );
};

export default RoomConfigList;