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
import exampleFile from "../../../assets/excel/example.xlsx"; // 参考文件路径
// import * as XLSX from 'xlsx';
import { processExcelToJson, splitJsonFile } from "./ExcelProcessor/ExcelProcessor"; // 引入处理函数

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const allTextData = processExcelToJson(data);
      if (allTextData) {
        const result = splitJsonFile(allTextData);
        setJsonResult(JSON.stringify(result, null, 2));
        setLoading(false);
      } else {
        setErrorMessage("No matching worksheets found");
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    setLoading(true);
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