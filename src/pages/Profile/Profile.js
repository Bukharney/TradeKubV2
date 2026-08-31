import React, { useState, useEffect, useContext } from "react";
import "./Profile.css";
import "boxicons/css/boxicons.min.css";
import AuthContext from "../../context/AuthContext";
import Cookies from "js-cookie";
import axios, { clearStoredTokens } from "../../services/axiosClient";
import TokenContext from "../../context/TokenContext";
import AccountContext from "../../context/AccountContext";
import LoadingOverlay from "react-loading-overlay";

export const Profile = () => {
  const Token = useContext(TokenContext);
  const Auth = useContext(AuthContext);
  const Accounts = useContext(AccountContext);

  const [userData, setUserData] = useState({});
  const [userAccount, setUserAccount] = useState({});
  const [userLog, setUserLog] = useState([]);
  const [userTsc, setUserTsc] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0.00";
    return Number(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleClickLogout = () => {
    Auth.setAuth(false);
    clearStoredTokens();
    Cookies.remove("account");
    window.location.href = "/";
  };

  const openEditModal = () => {
    setEditName(userData.name || "");
    setEditEmail(userData.email || "");
    setEditPhone(userData.phone || "");
    setEditPassword("");
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const payload = {
      name: editName,
      email: editEmail,
      phone: editPhone,
    };
    if (editPassword) {
      payload.password = editPassword;
    }

    try {
      await axios.put("/users/update", payload);
      setUserData((prev) => ({
        ...prev,
        name: editName,
        email: editEmail,
        phone: editPhone,
      }));
      setIsEditModalOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userRes, logRes] = await Promise.all([
          axios.get("/users/my"),
          axios.get("/users/login_info").catch(() => ({ data: [] })),
        ]);
        setUserData(userRes.data || {});
        setUserLog(logRes.data || []);
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    const fetchAccountData = async (accId) => {
      if (!accId) {
        setIsLoading(false);
        return;
      }
      try {
        const [accRes, tscRes] = await Promise.all([
          axios.get(`/account/${accId}`),
          axios.get(`/bank_tsc/my/${accId}`).catch(() => ({ data: [] })),
        ]);
        setUserAccount(accRes.data || {});
        setUserTsc(tscRes.data || []);
      } catch (err) {
        console.error("Error fetching account data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
    fetchAccountData(Accounts?.account);
  }, [Accounts?.account, Token?.token]);

  return (
    <LoadingOverlay active={isLoading} spinner className="profile-page-wrapper">
      <div className="profile-page-container">
        {/* Left Column: User Profile & Account Card */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-icon">
              <i className="bx bx-user"></i>
            </div>
            <div className="profile-verified-badge">
              <i className="bx bxs-badge-check"></i> Verified
            </div>
          </div>

          <h2 className="profile-user-name">{userData.name || "TradeKub User"}</h2>
          <p className="profile-user-role">Trader / Investor</p>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span className="info-label"><i className="bx bx-credit-card-alt"></i> Account ID</span>
              <span className="info-val">#{userAccount.id || Accounts?.account || "N/A"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label"><i className="bx bx-briefcase"></i> Broker</span>
              <span className="info-val">{userAccount.broker_name || "TradeKub Pro"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label"><i className="bx bx-mail-send"></i> Email</span>
              <span className="info-val">{userData.email || "N/A"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label"><i className="bx bx-phone"></i> Phone</span>
              <span className="info-val">{userData.phone || "N/A"}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label"><i className="bx bx-wallet"></i> Cash Balance</span>
              <span className="info-val green">฿{formatNumber(userAccount.cash_balance)}</span>
            </div>
          </div>

          <div className="profile-card-actions">
            <button className="btn-edit-profile" onClick={openEditModal}>
              <i className="bx bx-edit-alt"></i> Edit Profile
            </button>
            <button className="btn-logout" onClick={handleClickLogout}>
              <i className="bx bx-log-out"></i> Log Out
            </button>
          </div>
        </div>

        {/* Right Column: Bank Transactions & Security Logins */}
        <div className="profile-main-content">
          {/* Bank Transactions Section */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">
                <i className="bx bx-transfer-alt"></i> Bank Transactions
              </h3>
              <span className="section-card-badge">{userTsc.length} Transactions</span>
            </div>

            <div className="profile-list-scroll">
              {userTsc.length === 0 ? (
                <div className="profile-empty-list">No bank transactions recorded yet.</div>
              ) : (
                userTsc.map((tsc, idx) => (
                  <div key={idx} className="activity-item-row">
                    <div className="activity-left">
                      <span
                        className={`type-tag ${
                          tsc.type?.toLowerCase() === "deposit" ? "deposit" : "withdraw"
                        }`}
                      >
                        {tsc.type ? tsc.type.toUpperCase() : "TSC"}
                      </span>
                    </div>
                    <div className="activity-mid">
                      <span className="activity-amount">฿{formatNumber(tsc.amount)}</span>
                    </div>
                    <div className="activity-right">
                      <span className="activity-date">{formatDate(tsc.timestamp)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Device Login Log */}
          <div className="profile-section-card">
            <div className="section-card-header">
              <h3 className="section-card-title">
                <i className="bx bx-devices"></i> Active Login Sessions
              </h3>
              <span className="section-card-badge">{userLog.length} Sessions</span>
            </div>

            <div className="profile-list-scroll">
              {userLog.length === 0 ? (
                <div className="profile-empty-list">No device logins recorded.</div>
              ) : (
                userLog.map((log, idx) => (
                  <div key={idx} className="activity-item-row">
                    <div className="activity-left">
                      <span className="device-name">
                        <i className="bx bx-laptop"></i> {log.device || "Browser Session"}
                      </span>
                    </div>
                    <div className="activity-mid">
                      <span className="ip-address">IP: {log.ip || "127.0.0.1"}</span>
                    </div>
                    <div className="activity-right">
                      <span className="activity-date">{formatDate(log.login)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h3><i className="bx bx-user-pin"></i> Edit Account Profile</h3>
              <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                <i className="bx bx-x"></i>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-modal-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password (Optional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LoadingOverlay>
  );
};

export default Profile;



