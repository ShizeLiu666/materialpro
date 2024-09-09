import React, { useState } from "react";
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
import axios from "axios";

const CreateProjectModal = ({ isOpen, toggle }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [des, setDes] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        "/api/projects", // Assuming this is the correct API endpoint
        { name, address, des, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        // Reset form fields on successful creation
        setName("");
        setAddress("");
        setDes("");
        setPassword("");
        setError("");
        toggle(); // Close modal on successful creation
        // Optionally, you could call a fetch function here to refresh the project list
      } else {
        setError("Error creating project.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Create New Project</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          {error && <Alert color="danger">{error}</Alert>}
          <FormGroup>
            <Label for="name">
              <span style={{ color: "red" }}>*</span> Project Name:
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
            <Label for="password">
              <span style={{ color: "red" }}>*</span> Password:
            </Label>
            <Input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="address">
              <span style={{ color: "red" }}>*</span> Address:
            </Label>
            <Input
              type="text"
              name="address"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </FormGroup>
          <Button
            color="primary"
            size="sm"
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

export default CreateProjectModal;