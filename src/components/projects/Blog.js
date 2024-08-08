import React from "react";
import {
  Card,
  CardBody,
  CardImg,
  CardSubtitle,
  CardTitle,
} from "reactstrap";

const Blog = (props) => {
  return (
    <Card className="blog-card">
      <CardImg alt="Card image cap" src={props.image} />
      <CardBody className="p-4">
        <CardTitle tag="h5">{props.title}</CardTitle>
        <CardSubtitle>{props.subtitle}</CardSubtitle>
      </CardBody>
    </Card>
  );
};

export default Blog;