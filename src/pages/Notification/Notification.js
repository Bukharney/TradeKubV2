import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Notification.css";
import "boxicons/css/boxicons.min.css";
import TokenContext from "../../Context/TokenContext";
import axios from "../../services/axiosClient";
import AccountContext from "../../Context/AccountContext";

export const Notification = () => {
  const [click, setClick] = useState(false);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const Token = useContext(TokenContext);
  const Account = useContext(AccountContext);
  const navigate = useNavigate();

  const getTime = (dateString) => {
    if (!dateString) return "Just now";
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.get(`/noti/delete/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      setClick(!click);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(data.map((item) => axios.get(`/noti/delete/${item.id}`)));
      setData([]);
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  useEffect(() => {
    const fetchNotifications = async (accountId) => {
      try {
        const response = await axios.get(`/noti/${accountId}`);
        setData(response.data || []);
      } catch (error) {
        console.error(error.response);
        setData([]);
      }
    };

    if (Account?.account) {
      fetchNotifications(Account.account);
    }
  }, [Account?.account, Token?.token, click]);

  const handleClose = () => {
    navigate(-1);
  };

  const filteredData = data.filter((item) => {
    if (activeTab === "Orders") {
      return item.message?.toLowerCase().includes("order") || item.volume;
    }
    if (activeTab === "System") {
      return !item.message?.toLowerCase().includes("order") && !item.volume;
    }
    return true;
  });

  return (
    <div className="noti-drawer-overlay" onClick={handleClose}>
      <div className="noti-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="noti-drawer-header">
          <div className="noti-drawer-title">
            <i className="bx bx-bell"></i>
            <span>Notifications</span>
            {data.length > 0 && (
              <span className="noti-count-badge">{data.length}</span>
            )}
          </div>
          <button className="noti-close-btn" onClick={handleClose} title="Close Panel">
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Filter Tabs & Clear Action */}
        <div className="noti-toolbar">
          <div className="noti-tabs">
            {["All", "Orders", "System"].map((tab) => (
              <button
                key={tab}
                className={`noti-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {data.length > 0 && (
            <button className="noti-clear-btn" onClick={clearAllNotifications}>
              Clear All
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="noti-list-container">
          {filteredData.length === 0 ? (
            <div className="noti-empty-state">
              <i className="bx bx-bell-off noti-empty-icon"></i>
              <p className="noti-empty-title">No Notifications</p>
              <p className="noti-empty-sub">You're all caught up!</p>
            </div>
          ) : (
            filteredData.map((inbox) => (
              <div key={inbox.id || inbox.created_at} className="noti-card">
                <Link to="/Wallet" className="noti-card-link" onClick={handleClose}>
                  <div className="noti-card-icon">
                    <i
                      className={`bx ${
                        inbox.message?.toLowerCase().includes("buy")
                          ? "bx-trending-up buy"
                          : inbox.message?.toLowerCase().includes("sell")
                          ? "bx-trending-down sell"
                          : "bx-info-circle system"
                      }`}
                    ></i>
                  </div>
                  <div className="noti-card-content">
                    <div className="noti-card-top">
                      <span className="noti-msg">{inbox.message || "Order Notification"}</span>
                      <span className="noti-time">{getTime(inbox.created_at)}</span>
                    </div>
                    {inbox.volume && (
                      <div className="noti-vol-tag">
                        Volume: <strong>{inbox.volume}</strong>
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  className="noti-delete-btn"
                  onClick={(e) => deleteNotification(inbox.id, e)}
                  title="Dismiss notification"
                >
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;



