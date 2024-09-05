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
import { useExcelConverter } from './ExcelConverterContext';  // Adjust the path as needed
import { Alert } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import axios from "axios";
import exampleFile from "../../assets/excel/example.xlsx";
// import { API_development_environment } from "../../config";

const ExcelConverter = () => {
  const { jsonResult, setJsonResult } = useExcelConverter();

  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState(null); // Local state for the actual file
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState(10);

  // Adjust rows based on content length
  useEffect(() => {
    const lines = jsonResult.split("\n").length;
    setRows(Math.min(Math.max(10, lines), 21));
  }, [jsonResult]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const fileType = file?.type;

    if (
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      fileType !== "application/vnd.ms-excel"
    ) {
      setErrorMessage(
        "Only Excel files are accepted. Please upload a valid Excel file."
      );
      setFile(null);
    } else {
      setFile(file);
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
        `/api/excelToJson/convert`,
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
      console.error("Error:", error);
    }
  };

  const handleCopy = () => {
    if (jsonResult) {
      navigator.clipboard.writeText(jsonResult);
      setSuccessMessage("JSON content copied to clipboard.");
      setTimeout(() => {
        setSuccessMessage(""); // Clear the success message after a few seconds
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
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            Convert Excel file to JSON Format
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
                {/* <Label for="exampleFile">File</Label> */}
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

export default ExcelConverter;