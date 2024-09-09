import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";

const CreateRoomTypeModal = ({ isOpen, toggle, onCreate }) => {
  const [name, setName] = useState("");
  const [typeCode, setTypeCode] = useState("");
  const [des, setDes] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [error, setError] = useState("");
  const [isTypeCodeManuallyEdited, setIsTypeCodeManuallyEdited] =
    useState(false);

  // Function to generate typeCode from room type name
  const generateTypeCode = (name) => {
    const words = name
      .split(" ")
      .filter((word) => word.toLowerCase() !== "room" && word.trim() !== ""); // Filter out "Room" and empty words
    const initials = words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join(""); // Safely get the first letter and handle undefined or empty words
    return initials;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreate({ name, typeCode, des, iconUrl });
      setName("");
      setTypeCode("");
      setDes("");
      setIconUrl("");
      setError("");
      setIsTypeCodeManuallyEdited(false); // Reset the manual flag on form submission
      toggle();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Room type already exists.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  // Automatically update typeCode when name changes, but only if it has not been manually edited
  useEffect(() => {
    if (!isTypeCodeManuallyEdited) {
      setTypeCode(generateTypeCode(name));
    }
  }, [name, isTypeCodeManuallyEdited]); // Add isTypeCodeManuallyEdited to the dependency array
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle manual typeCode change
  const handleTypeCodeChange = (e) => {
    setTypeCode(e.target.value);
    setIsTypeCodeManuallyEdited(true); // Mark as manually edited
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Create New Room Type</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {error && <Alert color="danger">{error}</Alert>}
          <FormGroup>
            <Label for="name">
              <span style={{ color: "red" }}>*</span> Room Type Name:
            </Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="typeCode">
              <span style={{ color: "red" }}>*</span> Room Type Code:
            </Label>
            <Input
              type="text"
              name="typeCode"
              id="typeCode"
              value={typeCode}
              onChange={handleTypeCodeChange} // Handle manual changes
            />
          </FormGroup>
          <FormGroup>
            <Label for="des">Description:</Label>
            <Input
              type="text"
              name="des"
              id="des"
              value={des}
              onChange={(e) => setDes(e.target.value)}
            />
          </FormGroup>
          {/* <FormGroup>
            <Label for="iconUrl">Icon URL:</Label>
            <Input
              type="text"
              name="iconUrl"
              id="iconUrl"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
            />
          </FormGroup> */}
          <Button
            color="primary"
            type="submit"
            style={{
              backgroundColor: "#fbcd0b",
              borderColor: "#fbcd0b",
              fontWeight: "bold",
            }}
          >
            Create
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CreateRoomTypeModal;
