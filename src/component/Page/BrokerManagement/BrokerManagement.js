import React, { useContext, useState, useEffect } from "react";
import "./BrokerManagement.css";
import axios from "../../../API/axiosClient";
import TokenContext from "../../../Context/TokenContext";

export const BrokerManagement = () => {
  const [brokerName, setBrokerName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [brokerList, setBrokerList] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const Token = useContext(TokenContext);

  const fetchBrokers = async () => {
    try {
      const response = await axios.get("/broker/");
      setBrokerList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch broker list", error);
      setBrokerList([]);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, [Token.token]);

  const handleReset = () => {
    setBrokerName("");
    setApiKey("");
  };

  const handleSelectTableRow = (broker) => {
    setBrokerName(broker.name || "");
    setApiKey(broker.api_key || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brokerName) {
      alert("Please enter a Broker Company Name.");
      return;
    }

    const payload = {
      name: brokerName,
      api_key: apiKey || "default-api-key",
    };

    try {
      await axios.post("/broker/", payload);
      alert("Broker registered successfully!");
      handleReset();
      fetchBrokers();
    } catch (error) {
      console.error("Add broker failed", error);
      alert("Failed to register broker. Please try again.");
    }
  };

  const filteredBrokers = brokerList.filter((b) =>
    b.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    String(b.id).toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="broker-mgmt-container">
      <div className="mgmt-header-strip">
        <h1 className="ManagementHeader">
          <i className="bx bx-cog"></i> Broker Management Console
        </h1>
      </div>

      <div className="mgmt-terminal-grid">
        {/* Left Column: Register Form Card */}
        <div className="mgmt-left-panel">
          <div className="mgmt-form-card">
            <h3 className="form-card-header">
              <i className="bx bx-plus-circle"></i> Register Broker Company
            </h3>
            <form onSubmit={handleSubmit} className="mgmt-form">
              <div className="mgmt-form-group">
                <label>Broker Company Name</label>
                <input
                  type="text"
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  placeholder="e.g. Bualuang Securities..."
                  required
                />
              </div>

              <div className="mgmt-form-group">
                <label>API Key / Secret Token</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key token..."
                />
              </div>

              <div className="mgmt-actions">
                <button type="submit" className="submitAdd">
                  Register Broker
                </button>
                <button type="button" className="resetAdd" onClick={handleReset}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Data Table Panel */}
        <div className="mgmt-right-panel">
          <div className="mgmt-data-card">
            <div className="mgmt-data-header">
              <h3><i className="bx bx-table"></i> Registered Brokers List</h3>
              <div className="mgmt-search-box">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Filter brokers..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="mgmt-table-wrapper">
              <table className="mgmt-data-table">
                <thead>
                  <tr>
                    <th>Broker ID</th>
                    <th>Company Name</th>
                    <th>API Key / Token</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrokers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="no-data-td">
                        No registered broker records found.
                      </td>
                    </tr>
                  ) : (
                    filteredBrokers.map((b) => (
                      <tr
                        key={b.id}
                        className="table-row-clickable"
                        onClick={() => handleSelectTableRow(b)}
                      >
                        <td><strong>#{b.id}</strong></td>
                        <td>{b.name}</td>
                        <td className="ip-address">{b.api_key || "Standard"}</td>
                        <td>
                          <button
                            className="row-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTableRow(b);
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

export default BrokerManagement;

