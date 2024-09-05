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
import exampleFile from "../../../assets/excel/example.xlsx";
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

  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21));
  }, [jsonResult]);

  // 检查 Excel 文件的格式
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
      setErrorMessage(["Please select a file first."]); // 添加错误信息到数组
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
        setErrorMessage(["No matching worksheets found"]); // 添加错误信息到数组
      }
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmitJson = async () => {
    
    console.log('here: ', projectRoomId);

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
  
      // 检查 response 是否成功
      if (response.ok) {
        const data = await response.json();  // 检查响应数据
        if (data.success) {
          setSuccessMessage("JSON configuration submitted successfully.");
        } else {
          setErrorMessage([`Failed to submit JSON configuration: ${data.errorMsg}`]);
        }
      } else {
        setErrorMessage(["Failed to submit JSON configuration."]);
      }
      
      // 3秒后隐藏成功或错误信息
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage([]);
      }, 3000);
      
    } catch (error) {
      console.log('Error:', error);
      setErrorMessage(["An error occurred while submitting JSON."]);
    }
  };    

  const handleDownload = () => {
    if (jsonResult && file) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const blob = new Blob([jsonResult], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.json`;
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

          {/* 错误提示 */}
          {errorMessage.length > 0 && (
            <Alert
              severity="warning"
              onClose={() => setErrorMessage([])} // 允许用户点击关闭
            >
              {/* 使用 dangerouslySetInnerHTML 来解析 <br> 标签 */}
              <span
                dangerouslySetInnerHTML={{
                  __html: errorMessage.join("<br>"), // 将错误信息用 <br> 标签分割
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
                style={{ marginRight: "10px", marginBottom: "20px" }}
                onClick={handleCheckExcelFormat}
                disabled={!file}
              >
                Check Excel Format
              </Button>
              <Button
                style={{ marginBottom: "20px" }}
                type="submit"
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
              <Button
                style={{ marginBottom: "20px" }}
                onClick={handleSubmitJson}
                disabled={!jsonResult}
              >
                Submit
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
