import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";
import "boxicons/css/boxicons.min.css";
import axios from "../../services/axiosClient";
import TokenContext from "../../context/TokenContext";
import AccountContext from "../../context/AccountContext";

const storedValue = localStorage.getItem("key");
const defaultValue = { key: 0 };
export const value = storedValue ? JSON.parse(storedValue) : defaultValue;
export const hasRefresh = { rkey: 1 };

export const Navbar = ({ collapsed }) => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const Token = useContext(TokenContext);
  const Account = useContext(AccountContext);

  useEffect(() => {
    if (Account?.account) {
      axios
        .get(`/noti/${Account.account}`)
        .then((response) => {
          setData(response.data || []);
        })
        .catch(() => {
          setData([]);
        });
    }
  }, [Account?.account, Token?.token]);

  // Only hide sidebar on standalone Auth & Account Selection screens
  const hiddenRoutes = ["/", "/login", "/register", "/selectaccount"];
  const currentPath = location.pathname.toLowerCase();
  if (hiddenRoutes.some((route) => currentPath === route || currentPath === route + "/")) {
    return null;
  }

  const mainNavItems = [
    { path: "/Market", label: "Trade Market", icon: "bx bxs-dashboard" },
    { path: "/Wallet", label: "Wallet & Portfolio", icon: "bx bx-wallet" },
    { path: "/News", label: "Market News", icon: "bx bx-news" },
    {
      path: "/Notification",
      label: "Notifications",
      icon: "bx bx-notification",
      badge: data.length > 0,
    },
    { path: "/Profile", label: "Account Profile", icon: "bx bx-user" },
  ];

  return (
    <aside className={`sidebar-nav ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-nav__menu">
        <div className="sidebar-section-group">
          {!collapsed && <span className="sidebar-group-title">TRADING</span>}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav__item ${isActive ? "active" : ""}`
              }
              title={collapsed ? item.label : ""}
            >
              <div className="sidebar-nav__icon-wrapper">
                <i className={item.icon}></i>
                {item.badge && <span className="sidebar-nav__dot"></span>}
              </div>
              {!collapsed && <span className="sidebar-nav__label">{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {!collapsed && (
        <div className="sidebar-nav__footer">
          <div className="sidebar-nav__status">
            <span className="sidebar-nav__status-dot online"></span>
            <span className="sidebar-nav__status-text">System Connected</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Navbar;


