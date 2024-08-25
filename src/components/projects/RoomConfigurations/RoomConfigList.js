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
import { processExcelToJson, splitJsonFile, resetDeviceNameToType } from "./ExcelProcessor/ExcelProcessor"; // 引入处理函数和 resetDeviceNameToType
import { validateExcel } from "./ExcelProcessor/validation/main"; // 引入新的验证函数

const RoomConfigList = ({ roomTypeName }) => {
  const [file, setFile] = useState(null);
  const [jsonResult, setJsonResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);

  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21)); // at least 10 rows and max 21 rows
  }, [jsonResult]);

  // 检查 Excel 文件的格式
  const handleCheckExcelFormat = (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const validationResult = validateExcel(data);
      alert(validationResult); // 显示 JSON 数据
    };
    reader.readAsArrayBuffer(file);
  };

  // check the type of files && report corresponding error or success message
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const fileType = selectedFile?.type;
    
    // it is not an excel file?
    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "application/vnd.ms-excel"
    ) {
      setErrorMessage("Only Excel files are accepted. Please upload a valid Excel file.");
      setFile(null); // clear the selected file
    } else {
      setFile(selectedFile); // set the selected valid file
      setErrorMessage("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // prevent default form submission behavior (e.g., page refresh)
  
    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }
  
    // reset deviceNameToType mapping table for new file processing
    resetDeviceNameToType();
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const allTextData = processExcelToJson(data);
      
      // set loading state to true, indicating the file content is being processed
      setLoading(true);
  
      // was the content of the Excel file successfully parsed?
      if (allTextData) {
        const result = splitJsonFile(allTextData); // ! entry point for processing & splitting Excel data into JSON format
        setJsonResult(JSON.stringify(result, null, 2));
      } else {
        setErrorMessage("No matching worksheets found");
      }
      
      setLoading(false); // means process (success or failure) is finished
    };
  
    reader.readAsArrayBuffer(file); // read the file as an ArrayBuffer for processing
  };  

  const handleCopy = () => {
    if (jsonResult) {
      navigator.clipboard.writeText(jsonResult);
      setSuccessMessage("JSON content copied to clipboard.");
      // clear the success message after 3s
      setTimeout(() => {
        setSuccessMessage(""); 
      }, 3000);
    }
  };

  const handleDownload = () => {
    if (jsonResult && file) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); 
      const blob = new Blob([jsonResult], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.json`; // set download file name as excel input file name and .json for suffix
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

              {/* 检查 Excel 格式按钮 */}
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
                  onChange={(e) => setJsonResult(e.target.value)} // allow user to edit content
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