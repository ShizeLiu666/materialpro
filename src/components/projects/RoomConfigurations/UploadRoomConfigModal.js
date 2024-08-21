import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
// import axios from "axios";
import axiosInstance, { API_development_environment } from "../../../config";

const UploadRoomConfigModal = ({ isOpen, toggle, projectId, roomTypeId }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel")
    ) {
      setFile(selectedFile);
      setErrorMessage("");
    } else {
      setErrorMessage("Please upload a valid Excel file.");
      setFile(null);
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
      const token = localStorage.getItem("authToken");
      const response = await axiosInstance.post(
        `${API_development_environment}/api/projects/${projectId}/${roomTypeId}/uploadConfig`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccessMessage("File uploaded successfully!");
      setLoading(false);
      setFile(null);
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message after 3 seconds
        toggle(); // Close the modal
      }, 3000);
    } catch (error) {
      setErrorMessage("Error uploading file. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Upload Room Configuration File</ModalHeader>
      <ModalBody>
        {errorMessage && (
          <Alert color="danger">
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert color="success">
            {successMessage}
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="configFile">Choose Excel File</Label>
            <Input
              type="file"
              id="configFile"
              name="file"
              onChange={handleFileChange}
              required
            />
          </FormGroup>
          <Button 
            color="primary" 
            size="sm" 
            type="submit" 
            style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }}
            disabled={loading || !file}
          >
            {loading ? <Spinner size="sm" /> : "Submit"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default UploadRoomConfigModal;