import React, { useContext, useState, useEffect } from "react";
import "./PortfolioManagement.css";
import axios from "../../../API/axiosClient";
import TokenContext from "../../../Context/TokenContext";

export const PortfolioManagement = () => {
  const [brokerId, setBrokerId] = useState("1");
  const [accountId, setAccountId] = useState("");
  const [symbol, setSymbol] = useState("");
  const [volume, setVolume] = useState("");
  const [price, setPrice] = useState("");

  const [portList, setPortList] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const Token = useContext(TokenContext);

  const fetchPortfolio = async () => {
    if (!accountId) return;
    try {
      const response = await axios.get(`/portfolio/${accountId}`);
      setPortList(response.data || []);
    } catch (error) {
      console.error(error);
      setPortList([]);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchPortfolio();
    }
  }, [accountId, Token.token]);

  const handleReset = () => {
    setSymbol("");
    setVolume("");
    setPrice("");
  };

  const handleSelectTableRow = (item) => {
    setSymbol(item.symbol || "");
    setVolume(String(item.volume || ""));
    setPrice(String(item.last_price || item.close || ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !symbol || !volume || !price) {
      alert("Please fill in Account ID, Symbol, Volume, and Price.");
      return;
    }

    const payload = {
      account_id: Number(accountId),
      symbol: symbol.toUpperCase(),
      volume: Number(volume),
      price: Number(price),
    };

    try {
      await axios.post("/portfolio/", payload);
      alert("Portfolio transaction updated successfully!");
      handleReset();
      fetchPortfolio();
    } catch (error) {
      console.error("Failed to update portfolio", error);
      alert("Failed to update portfolio. Please verify parameters.");
    }
  };

  const filteredPort = portList.filter((item) =>
    item.symbol?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="portfolio-mgmt-container">
      <div className="mgmt-header-strip">
        <h1 className="ManagementHeader5">
          <i className="bx bx-pie-chart-alt-2"></i> Portfolio Management Console
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
        {/* Left Column: Form Panel */}
        <div className="mgmt-left-panel">
          <div className="mgmt-form-card">
            <h3 className="form-card-header"><i className="bx bx-plus-circle"></i> Add / Edit Portfolio Position</h3>
            <form onSubmit={handleSubmit} className="mgmt-form">
              <div className="mgmt-form-group">
                <label>Target Account ID</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter Account ID..."
                  required
                />
              </div>

              <div className="mgmt-form-group">
                <label>Stock Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. KBANK, PTT..."
                  required
                />
              </div>

              <div className="mgmt-form-group">
                <label>Shares Volume</label>
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Enter number of shares..."
                  required
                />
              </div>

              <div className="mgmt-form-group">
                <label>Unit Price (THB)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price per share..."
                  required
                />
              </div>

              <div className="mgmt-actions">
                <button type="submit" className="submitAdd">
                  Submit Transaction
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
              <h3><i className="bx bx-table"></i> Account Portfolio Holdings</h3>
              <div className="mgmt-search-box">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Filter symbols..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="mgmt-table-wrapper">
              <table className="mgmt-data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Volume</th>
                    <th>Price</th>
                    <th>Total Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!accountId ? (
                    <tr>
                      <td colSpan={5} className="no-data-td">
                        Enter an Account ID on the left to load portfolio holdings.
                      </td>
                    </tr>
                  ) : filteredPort.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-data-td">
                        No portfolio positions found for Account #{accountId}.
                      </td>
                    </tr>
                  ) : (
                    filteredPort.map((item) => (
                      <tr
                        key={item.symbol}
                        className="table-row-clickable"
                        onClick={() => handleSelectTableRow(item)}
                      >
                        <td><strong>{item.symbol}</strong></td>
                        <td>{(item.volume || 0).toLocaleString()}</td>
                        <td>฿{(item.last_price || item.close || 0).toFixed(2)}</td>
                        <td className="green-val">
                          ฿{((item.volume || 0) * (item.last_price || item.close || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button
                            className="row-edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTableRow(item);
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

export default PortfolioManagement;

