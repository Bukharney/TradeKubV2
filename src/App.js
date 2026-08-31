import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar";
import { HeaderBar } from "./components/HeaderBar/HeaderBar";
import { Login } from "./pages/Login/Login";
import { Home } from "./pages/Homepage/Home";
import { Market } from "./pages/Market/Market";
import { Wallet } from "./pages/Wallet/Wallet";
import { News } from "./pages/News/News";
import { Notification } from "./pages/Notification/Notification";
import { Profile } from "./pages/Profile/Profile";
import AuthContext from "./Context/AuthContext";
import TokenContext from "./Context/TokenContext";
import AccountContext from "./Context/AccountContext";
import { ProtectedRoute } from "./Context/ProtectedRoute";
import Cookies from "js-cookie";
import "./App.css";
import Register from "./pages/Register/Register";
import { View } from "./pages/View/View";

import { AnalyticPage } from "./pages/AnalyticPage/AnalyticPage";
import { SelectAccount } from "./pages/SelectAccount/SelectAccount";
import axios, { getStoredToken, clearStoredTokens } from "./services/axiosClient";
import EditUser from "./pages/EditUserProfile/EditUser";


function AppShell({ auth }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const currentPath = location.pathname.toLowerCase();
  const isStandalone = [
    "/",
    "/login",
    "/register",
    "/selectaccount",
  ].some((path) => currentPath === path || currentPath === path + "/");

  return (
    <div className={`app-shell ${isStandalone ? "standalone" : ""}`}>
      {!isStandalone && (
        <HeaderBar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
      )}
      <div className="app-body">
        {!isStandalone && <Navbar collapsed={sidebarCollapsed} />}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/Login"
              element={auth ? <Navigate to="/SelectAccount" replace /> : <Login />}
            />
            <Route
              path="/Register"
              element={auth ? <Navigate to="/SelectAccount" replace /> : <Register />}
            />
            <Route
              path="/Market"
              element={
                <ProtectedRoute>
                  <Market />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/News"
              element={
                <ProtectedRoute>
                  <News />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Notification"
              element={
                <ProtectedRoute>
                  <Notification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/View" element={<View />} />
            <Route
              path="/AnalyticPage"
              element={
                <ProtectedRoute>
                  <AnalyticPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/SelectAccount"
              element={
                <ProtectedRoute>
                  <SelectAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditUser"
              element={
                <ProtectedRoute>
                  <EditUser />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState("");
  const [account, setAccount] = useState("");
  const [isLoading, setLoading] = useState(true);

  const readCookie = async () => {
    let token = getStoredToken();
    let account = Cookies.get("account");
    if (token) {
      setAccount(account);
      setToken(token);
      setAuth(true);
      await axios
        .get("/account/my")
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
          if (error?.response?.status === 401) {
            clearStoredTokens();
            setAuth(false);
          }
        });
      console.log("readCookie");
      console.log(token);
    }
  };

  useEffect(() => {
    readCookie();
    setLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <TokenContext.Provider value={{ token, setToken }}>
        <AccountContext.Provider value={{ account, setAccount }}>
          <Router>
            <AppShell auth={auth} />
          </Router>
        </AccountContext.Provider>
      </TokenContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

