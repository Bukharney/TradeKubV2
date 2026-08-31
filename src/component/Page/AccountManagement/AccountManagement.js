import React, { useContext, useState, useEffect } from "react";
import "./AccountManagement.css";
import axios from "../../../API/axiosClient";
import TokenContext from "../../../Context/TokenContext";

export const AccountManagement = () => {
  const [selectedButton, setSelectedButton] = useState("Add");
  const [brokerId, setBrokerId] = useState("1");
  const [accountIdOrUser, setAccountIdOrUser] = useState("");
  const [pin, setPin] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [lineAvailable, setLineAvailable] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  const [accountList, setAccountList] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const Token = useContext(TokenContext);

  const fetchAccountList = async () => {
    try {
      const response = await axios.get("/account/");
      setAccountList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch accounts list", error);
      // Fallback
      setAccountList([]);
    }
  };

  useEffect(() => {
    fetchAccountList();
  }, [Token.token]);

  const handleReset = () => {
    setAccountIdOrUser("");
    setPin("");
    setCashBalance("");
    setLineAvailable("");
    setCreditLimit("");
  };

  const handleTabChange = (tab) => {
    setSelectedButton(tab);
    handleReset();
  };

  const handleSelectTableRow = (acc) => {
    setSelectedButton("Edit");
    setBrokerId(String(acc.broker_id || "1"));
    setAccountIdOrUser(String(acc.id || ""));
    setCashBalance(String(acc.cash_balance || 0));
    setLineAvailable(String(acc.line_available || 0));
    setCreditLimit(String(acc.credit_limit || 0));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!pin || pin.length !== 6 || isNaN(pin)) {
      alert("PIN must be exactly 6 digits.");
      return;
    }

    try {
      // First get user ID
      const userRes = await axios.get(`/users/username/${accountIdOrUser}`);
      const userId = userRes.data?.id;
      if (!userId) {
        alert("User not found!");
        return;
      }

      const payload = {
        user_id: Number(userId),
        broker_id: Number(brokerId),
        cash_balance: 0,
        line_available: 0,
        credit_limit: Number(creditLimit || 0),
        pin: Number(pin),
      };

      await axios.post("/account/", payload);
      alert("Account created successfully!");
      handleReset();
      fetchAccountList();
    } catch (err) {
      console.error(err);
      alert("Create account failed. Please check your inputs.");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!accountIdOrUser) {
      alert("Please enter an Account ID.");
      return;
    }

    try {
      // Fetch current account data
      const currentAcc = await axios.get(`/account/${accountIdOrUser}`);
      const accData = currentAcc.data || {};

      const payload = {
        user_id: accData.user_id,
        broker_id: Number(brokerId || accData.broker_id),
        cash_balance: cashBalance !== "" ? Number(cashBalance) : accData.cash_balance,
        line_available: lineAvailable !== "" ? Number(lineAvailable) : accData.line_available,
        credit_limit: creditLimit !== "" ? Number(creditLimit) : accData.credit_limit,
        pin: pin !== "" ? Number(pin) : accData.pin,
      };

      await axios.put(`/account/${accountIdOrUser}`, payload);
      alert("Account updated successfully!");
      handleReset();
      fetchAccountList();
    } catch (err) {
      console.error(err);
      alert("Update failed. Please check Account ID.");
    }
  };

  const handleSubmitDelete = async (e) => {
    e.preventDefault();
    if (!accountIdOrUser) {
      alert("Please enter an Account ID.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete Account #${accountIdOrUser}?`)) {
      return;
    }

    try {
      await axios.delete(`/account/${accountIdOrUser}`);
      alert("Account deleted successfully!");
      handleReset();
      fetchAccountList();
    } catch (err) {
      console.error(err);
      alert("Delete failed. Account not found.");
    }
  };

  const filteredAccounts = accountList.filter((acc) => {
    const q = searchFilter.toLowerCase();
    return (
      String(acc.id).toLowerCase().includes(q) ||
      String(acc.broker_id).toLowerCase().includes(q) ||
      String(acc.user_id).toLowerCase().includes(q)
    );
  });

  return (
    <div className="account-mgmt-container">
      <div className="mgmt-header-strip">
        <h1 className="ManagementHeader1">
          <i className="bx bx-slider-alt"></i> Account Management Console
        </h1>
        <div className="broker-bar">
          <label><i className="bx bx-building"></i> Broker ID</label>
          <input
            type="text"
            value={brokerId}
            onChange={(e) => setBrokerId(e.target.value)}
            placeholder="Broker ID..."
            className="brokerBox"
          />
        </div>
      </div>

      <div className="mgmt-terminal-grid">
        {/* Left Column: Form Action Card */}
        <div className="mgmt-left-panel">
          <div className="button-group">
            <button
              className={`buttonAdd ${selectedButton === "Add" ? "selected" : ""}`}
              onClick={() => handleTabChange("Add")}
            >
              <i className="bx bx-plus-circle"></i> Add
            </button>
            <button
              className={`buttonEdit ${selectedButton === "Edit" ? "selected" : ""}`}
              onClick={() => handleTabChange("Edit")}
            >
              <i className="bx bx-edit"></i> Edit
            </button>
            <button
              className={`buttonDelete ${selectedButton === "Delete" ? "selected" : ""}`}
              onClick={() => handleTabChange("Delete")}
            >
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>

          <div className="mgmt-form-card">
            {selectedButton === "Add" && (
              <form onSubmit={handleSubmitAdd} className="mgmt-form">
                <div className="mgmt-form-group">
                  <label>Target Username</label>
                  <input
                    type="text"
                    value={accountIdOrUser}
                    onChange={(e) => setAccountIdOrUser(e.target.value)}
                    placeholder="Enter existing username..."
                    required
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Account PIN (6 Digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Set 6-digit PIN..."
                    required
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Credit Limit (THB)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="Set credit limit..."
                  />
                </div>
                <div className="mgmt-actions">
                  <button type="submit" className="submitAdd">
                    Create Account
                  </button>
                  <button type="button" className="resetAdd" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            )}

            {selectedButton === "Edit" && (
              <form onSubmit={handleSubmitEdit} className="mgmt-form">
                <div className="mgmt-form-group">
                  <label>Account ID</label>
                  <input
                    type="text"
                    value={accountIdOrUser}
                    onChange={(e) => setAccountIdOrUser(e.target.value)}
                    placeholder="Target Account ID..."
                    required
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Update PIN (6 Digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Leave blank to keep PIN..."
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Cash Balance (THB)</label>
                  <input
                    type="number"
                    value={cashBalance}
                    onChange={(e) => setCashBalance(e.target.value)}
                    placeholder="Update cash balance..."
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Line Available (THB)</label>
                  <input
                    type="number"
                    value={lineAvailable}
                    onChange={(e) => setLineAvailable(e.target.value)}
                    placeholder="Update line available..."
                  />
                </div>
                <div className="mgmt-form-group">
                  <label>Credit Limit (THB)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="Update credit limit..."
                  />
                </div>
                <div className="mgmt-actions">
                  <button type="submit" className="submitEdit1">
                    Update Account
                  </button>
                  <button type="button" className="resetEdit1" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            )}

            {selectedButton === "Delete" && (
              <form onSubmit={handleSubmitDelete} className="mgmt-form">
                <div className="mgmt-form-group">
                  <label>Account ID to Delete</label>
                  <input
                    type="text"
                    value={accountIdOrUser}
                    onChange={(e) => setAccountIdOrUser(e.target.value)}
                    placeholder="Target Account ID..."
                    required
                  />
                </div>
                <div className="mgmt-actions">
                  <button type="submit" className="submitDelete">
                    Delete Account
                  </button>
                  <button type="button" className="resetDelete" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Data Table Panel */}
        <div className="mgmt-right-panel">
          <div className="mgmt-data-card">
            <div className="mgmt-data-header">
              <h3><i className="bx bx-table"></i> Live Accounts List</h3>
              <div className="mgmt-search-box">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Filter accounts..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="mgmt-table-wrapper">
              <table className="mgmt-data-table">
                <thead>
                  <tr>
                    <th>Acc ID</th>
                    <th>Broker ID</th>
                    <th>User ID</th>
                    <th>Cash Bal</th>
                    <th>Line Available</th>
                    <th>Credit Limit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="no-data-td">
                        No account records found.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="table-row-clickable"
                        onClick={() => handleSelectTableRow(acc)}
                        title="Click to select for Edit"
                      >
                        <td><strong>#{acc.id}</strong></td>
                        <td>{acc.broker_id}</td>
                        <td>{acc.user_id}</td>
                        <td className="green-val">฿{(acc.cash_balance || 0).toLocaleString()}</td>
                        <td>฿{(acc.line_available || 0).toLocaleString()}</td>
                        <td>฿{(acc.credit_limit || 0).toLocaleString()}</td>
                        <td>
                          <button
                            className="row-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTableRow(acc);
                            }}
                          >
                            <i className="bx bx-edit"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;


