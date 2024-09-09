import React from "react";
import { Nav, NavItem } from "reactstrap";
import { Link, useLocation } from "react-router-dom";
import '../assets/scss/loader/Sidebar.css'
import projecttIcon from '../assets/icons/project.png';
// import convertIcon from '../assets/icons/convert_file.png';
// import aboutIcon from '../assets/icons/about.png';

const navigation = [
  {
    title: "Projects",
    href: "/admin/projects",
    img: projecttIcon,
  },
  // {
  //   title: "Converter",
  //   href: "/admin/excelconverter",
  //   img: convertIcon,
  // },
  // {
  //   title: "About",
  //   href: "/admin/about",
  //   icon: aboutIcon,
  // },
  // {
  //   title: "Dashboard",
  //   href: "/admin/starter",
  //   icon: "bi bi-speedometer2",
  // },
  // {
  //   title: "Alert",
  //   href: "/admin/alerts",
  //   icon: "bi bi-bell",
  // },
  // {
  //   title: "Badges",
  //   href: "/admin/badges",
  //   icon: "bi bi-patch-check",
  // },
  // {
  //   title: "Buttons",
  //   href: "/admin/buttons",
  //   icon: "bi bi-hdd-stack",
  // },
  // {
  //   title: "Grid",
  //   href: "/admin/grid",
  //   icon: "bi bi-columns",
  // },
  // {
  //   title: "Table",
  //   href: "/admin/table",
  //   icon: "bi bi-layout-split",
  // },
  // {
  //   title: "Breadcrumbs",
  //   href: "/admin/breadcrumbs",
  //   icon: "bi bi-link",
  // },
  // {
  //   title: "Form",
  //   href: "/admin/forms",
  //   icon: "bi bi-people",
  // },
];

const Sidebar = () => {
  let location = useLocation();

  return (
    <div>
      <div className="d-flex align-items-center"></div>
      <div className="p-3 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "active nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                {navi.img ? (
                  <img
                    src={navi.img}
                    alt={navi.title}
                    style={{
                      filter: location.pathname === navi.href ? 'brightness(0) invert(1)' : 'none',
                      width: '20px',
                      height: '20px'
                    }}
                  />
                ) : (
                  <i className={navi.icon}></i>
                )}
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;