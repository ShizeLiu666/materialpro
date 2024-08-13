import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button } from 'reactstrap';

const CreateRoomTypeModal = ({ isOpen, toggle, onCreate }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(name); // 调用父组件的创建函数
    setName(''); // 清空输入框
    toggle(); // 关闭模态框
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Create New Room Type</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label for="name">Room Type Name</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <Button 
            color="primary" 
            size="sm" 
            type="submit" 
            style={{ backgroundColor: "#fbcd0b", borderColor: "#fbcd0b", fontWeight: "bold" }}
          >
            Create
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default CreateRoomTypeModal;