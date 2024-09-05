// src/components/PasswordModal.js
import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const PasswordModal = ({ isOpen, toggle, projectName, onSubmit }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    setPassword("");
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Enter Password for {projectName}</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" size="sm" type="submit" style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }}>
            Submit
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default PasswordModal;