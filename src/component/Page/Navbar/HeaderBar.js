import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HeaderBar.css";
import TokenContext from "../../../Context/TokenContext";
import AccountContext from "../../../Context/AccountContext";
import AuthContext from "../../../Context/AuthContext";
import Cookies from "js-cookie";
import axios, { clearStoredTokens } from "../../../API/axiosClient";

export const HeaderBar = ({ sidebarCollapsed, toggleSidebar }) => {
  const Token = useContext(TokenContext);
  const Account = useContext(AccountContext);
  const Auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [accountInfo, setAccountInfo] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [notiCount, setNotiCount] = useState(0);

  // Dropdown states
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const accountDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    Auth.setAuth(false);
    clearStoredTokens();
    Cookies.remove("account");
    window.location.href = "/";
  };

  const handleSelectAccount = (accId) => {
    Account.setAccount(accId);
    Cookies.set("account", accId);
    setIsAccountDropdownOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    if (Account?.account) {
      axios
        .get(`/account/${Account.account}`)
        .then((res) => setAccountInfo(res.data))
        .catch((err) => console.error(err));

      axios
        .get(`/noti/${Account.account}`)
        .then((res) => setNotiCount(res.data?.length || 0))
        .catch(() => setNotiCount(0));
    }

    // Fetch user account list for switcher dropdown
    axios
      .get("/account/my")
      .then((res) => setAllAccounts(res.data || []))
      .catch(() => {
        axios.get("/account/").then((res) => setAllAccounts(res.data || [])).catch(() => {});
      });
  }, [Account?.account, Token?.token]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-bar__left">
        <button
          className="header-bar__toggle-btn"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <i className={`bx ${sidebarCollapsed ? "bx-menu" : "bx-menu-alt-left"}`}></i>
        </button>
        <div className="header-bar__brand" onClick={() => navigate("/Market")}>
          <span className="header-bar__brand-title">TradeKub</span>
          <span className="header-bar__brand-tag">PRO</span>
        </div>
        <div className="header-bar__tickers">
          <div className="header-ticker">
            <span className="header-ticker__symbol">KBANK</span>
            <span className="header-ticker__price up">254.00</span>
            <span className="header-ticker__chg up">+0.80%</span>
          </div>
          <div className="header-ticker">
            <span className="header-ticker__symbol">BBL</span>
            <span className="header-ticker__price down">189.05</span>
            <span className="header-ticker__chg down">-0.50%</span>
          </div>
          <div className="header-ticker">
            <span className="header-ticker__symbol">PTT</span>
            <span className="header-ticker__price up">34.50</span>
            <span className="header-ticker__chg up">+1.20%</span>
          </div>
        </div>
      </div>

      <div className="header-bar__right">
        {/* Account Switcher Dropdown */}
        <div className="header-dropdown-wrapper" ref={accountDropdownRef}>
          <div
            className="header-bar__account-card clickable"
            onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
            title="Switch Active Account"
          >
            <div className="header-bar__account-id">
              <i className="bx bx-credit-card-alt"></i> Account #{accountInfo?.id || Account.account}
              <i className="bx bx-chevron-down dropdown-arrow"></i>
            </div>
            <div className="header-bar__account-bal">
              <span>Cash:</span> <strong>฿{(accountInfo?.cash_balance || 0).toLocaleString()}</strong>
            </div>
          </div>

          {isAccountDropdownOpen && (
            <div className="header-popover-menu account-menu">
              <div className="popover-header">Select Trading Account</div>
              <div className="popover-account-list">
                {allAccounts.length === 0 ? (
                  <div className="popover-item disabled">No accounts available</div>
                ) : (
                  allAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className={`popover-item ${
                        acc.id === (accountInfo?.id || Account.account) ? "active" : ""
                      }`}
                      onClick={() => handleSelectAccount(acc.id)}
                    >
                      <div className="acc-item-left">
                        <i className="bx bx-check-circle acc-check"></i>
                        <span>Account #{acc.id}</span>
                      </div>
                      <span className="acc-item-bal">฿{(acc.cash_balance || 0).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          className="header-bar__icon-btn"
          onClick={() => navigate("/Notification")}
          title="Notifications"
        >
          <i className="bx bx-bell"></i>
          {notiCount > 0 && <span className="header-bar__badge">{notiCount}</span>}
        </button>

        {/* User Profile Popover */}
        <div className="header-dropdown-wrapper" ref={userMenuRef}>
          <div
            className="header-bar__profile clickable"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="User Profile Menu"
          >
            <div className="header-bar__avatar">
              <i className="bx bx-user"></i>
            </div>
          </div>

          {isUserMenuOpen && (
            <div className="header-popover-menu user-menu">
              <div className="user-popover-header">
                <i className="bx bx-user-circle"></i>
                <div className="user-popover-info">
                  <span className="user-popover-title">Account Options</span>
                  <span className="user-popover-sub">TradeKub Trader</span>
                </div>
              </div>
              <div className="popover-divider"></div>
              <div
                className="popover-menu-item"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate("/Profile");
                }}
              >
                <i className="bx bx-user"></i> User Profile
              </div>
              <div className="popover-divider"></div>
              <div className="popover-menu-item logout" onClick={handleLogout}>
                <i className="bx bx-log-out"></i> Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;

