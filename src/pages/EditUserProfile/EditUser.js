import React, { useState, useEffect, useContext } from "react";
import "./EditUser.css";
import axios from "../../services/axiosClient";
import TokenContext from "../../Context/TokenContext";
import { useNavigate } from "react-router-dom";

export const EditUser = () => {
  const Token = useContext(TokenContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const get_user_info = async () => {
      try {
        const response = await axios.get(`/users/my`);
        setUserData(response.data || {});
        setEmail(response.data?.email || "");
        setPhone(response.data?.phone || "");
        setName(response.data?.name || "");
      } catch (error) {
        console.error(error);
      }
    };

    get_user_info();
  }, [Token?.token]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    const data = {
      name: name,
      phone: phone,
      email: email,
    };
    if (password) {
      data.password = password;
    }

    try {
      await axios.put("/users/update", data);
      alert("Profile updated successfully!");
      navigate("/Profile");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    navigate("/Profile");
  };

  return (
    <div className="edit-user-page-wrapper">
      <div className="edit-user-card">
        <div className="edit-user-header">
          <div className="edit-user-icon">
            <i className="bx bx-user-pin"></i>
          </div>
          <h2>Edit User Profile</h2>
          <p>Update your personal account details below.</p>
        </div>

        <form onSubmit={handleConfirm} className="edit-user-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              placeholder={userData.name || "Full Name"}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              placeholder={userData.email || "Email"}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              placeholder={userData.phone || "Phone Number"}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password (Optional)</label>
            <input
              type="password"
              value={password}
              placeholder="Leave blank to keep current password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="edit-user-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;



