import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';

const EditRoomTypeModal = ({ isOpen, toggle, currentName, onSave }) => {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(name); // 调用父组件的保存函数
    toggle(); // 关闭模态框
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Room Type Name</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Room Type Name:</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <Button color="primary" size="sm" type="submit" style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }}>
            Save
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default EditRoomTypeModal;
