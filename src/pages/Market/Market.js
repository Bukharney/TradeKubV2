import React, { useEffect, useState, useContext } from "react";
import "./Market.css";
import CandleChart from "./CandleChart";
import axios from "../../services/axiosClient";
import TokenContext from "../../Context/TokenContext";
import AccountContext from "../../Context/AccountContext";
import { NumericFormat, PatternFormat } from "react-number-format";
import LoadingOverlay from "react-loading-overlay";
import PopUP from "./PopUP";
import { cancelOrder, placeOrder } from "../../services/API";


const INTERVAL_PRESETS = [
  { label: "1D", interval: "5m", period: "1d", limit: 60 },
  { label: "5D", interval: "1h", period: "5d", limit: 100 },
  { label: "1M", interval: "1d", period: "1mo", limit: 100 },
  { label: "3M", interval: "1d", period: "3mo", limit: 100 },
  { label: "1Y", interval: "1wk", period: "1y", limit: 100 },
];

export const Market = () => {
  const Token = useContext(TokenContext);
  const Account = useContext(AccountContext);
  const [isLoading, setIsloading] = useState(true);
  const [symbol, setSymbol] = useState("KBANK");
  const [marketData, setMarketData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Buy");
  const [Price, setPrice] = useState("");
  const [Volume, setVolume] = useState("");
  const [Pin, setPin] = useState("");
  const [cancelPin, setCancelPin] = useState("");
  const [inputBorderColor1, setInputBorderColor1] = useState("");
  const [inputBorderColor2, setInputBorderColor2] = useState("");
  const [inputBorderColor3, setInputBorderColor3] = useState("");
  const [userAccount, setUserAccount] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [userStock, setUserStock] = useState([]);
  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedInterval, setSelectedInterval] = useState("1M");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleIntervalChange = async (preset) => {
    setSelectedInterval(preset.label);
    setIsLoadingGraph(true);
    try {
      const limitVal = preset.limit || 100;
      const response = await axios.get(
        `/stock/market/${symbol}/${preset.interval}/${limitVal}?period=${preset.period}`
      );
      if (response.data) {
        setMarketData((prev) => ({
          ...(typeof prev === "object" ? prev : {}),
          candlestick_50limit: response.data.candlestick_50limit || response.data,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  const totalPrice = Number(Price) * Number(Volume);

  const formatNumber = (Number) => {
    return Number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const togglePopup = (stock) => {
    console.log(stock);
    setSelectedStock(stock);
    setIsPopupOpen(!isPopupOpen);
  };

  const handlePinChange = (event) => {
    setCancelPin(event.target.value);
  };

  const handleCancelOrder = () => {
    console.log("Order Cancelled");
    setCancelPin("");
    togglePopup(null);
  };

  const handleOkClick = () => {
    console.log("OK Clicked");
    cancelOrder(selectedStock.id);
    togglePopup(null);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleOrderClick = () => {
    console.log("Place order clicked");
    const data = {
      account_id: Account.account,
      symbol: symbol,
      type: "Normal",
      volume: Number(Volume),
      price: Number(Price),
      side: selectedOption,
      validity: "Day",
      pin: Number(Pin),
    };
    (async () => {
      setUserOrder(await placeOrder(data, Token, Account));
      setVolume("");
      setPrice("");
      setPin("");
    })();
  };

  const handleResetClick = () => {
    setPrice("");
    setVolume("");
    setPin("");
    console.log("Reset order clicked");
  };

  const handleInputFocus1 = () => setInputBorderColor1("#CCFF00");
  const handleInputBlur1 = () => setInputBorderColor1("");
  const handleInputFocus2 = () => setInputBorderColor2("#CCFF00");
  const handleInputBlur2 = () => setInputBorderColor2("");
  const handleInputFocus3 = () => setInputBorderColor3("#CCFF00");
  const handleInputBlur3 = () => setInputBorderColor3("");

  useEffect(() => {
    setIsLoadingGraph(true);
    const get_market_data = async (sym) => {
      await axios
        .get(`/stock/market_data/${sym}`)
        .then((response) => {
          console.log(response.data);
          setMarketData(response.data);
          setIsLoadingGraph(false);
          setIsloading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoadingGraph(false);
          setIsloading(false);
        });
    };

    const get_account_info = async (e) => {
      await axios
        .get(`/account/${e}`)
        .then((response) => {
          console.log(response.data);
          setUserAccount(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const get_order = async (e) => {
      await axios
        .get(`/order/${e}`)
        .then((response) => {
          console.log(response.data);
          setUserOrder(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    get_order(Account.account);
    get_market_data(symbol);
    get_account_info(Account.account);
  }, [Account.account, symbol, Token.token]);

  useEffect(() => {
    const get_stock = async () => {
      await axios
        .get(`/stock/`)
        .then((response) => {
          console.log(response.data);
          setUserStock(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    get_stock();
  }, [Token.token]);

  if (isLoading) {
    return (
      <LoadingOverlay active={isLoading} spinner>
        <div className="Market__container"></div>
      </LoadingOverlay>
    );
  }

  const availableStocksList = userStock;
  const filteredStocks = availableStocksList.filter((stk) =>
    stk.symbol.toLowerCase().includes(modalSearchTerm.toLowerCase())
  );

  return (
    <div className="Market__container">
      <div className="Market__container__mid">
        <div className="Market__container__mid__header">
          <div className="Market__container__mid__header__left">
            <div className="Market__container__symbol">
              <div className="Market__stock__symbol">Symbol</div>
              <button
                className="Market__symbol__select__btn"
                onClick={() => setIsSearchModalOpen(true)}
                title="Click or press Ctrl+K to change stock symbol"
              >
                <span>{symbol}</span>
                <i className="bx bx-search-alt-2"></i>
                <kbd className="Market__kbd__hint">Ctrl+K</kbd>
              </button>
            </div>
            <div className="Market__container__last_Price">
              <div className="Market__stock__Last_Price">last Price</div>
              <div
                className="Market__stock__Last_Price__value"
                style={{
                  color:
                    ((marketData?.price_info?.change ?? marketData?.quote_symbol?.percentChange) || 0) >= 0
                      ? "#00E396"
                      : "#FF334B",
                }}
              >
                {formatNumber(marketData?.price_info?.last ?? marketData?.quote_symbol?.last ?? 0)}
              </div>
            </div>
          </div>
          <div className="Market__container__mid__header__right">
            <div className="Market__container__width">
              <div className="Market__container__CHG">
                <div className="Market__stock__CHG">%CHG</div>
                <div
                  className="Market__stock__CHG__value"
                  style={{
                    color:
                      ((marketData?.price_info?.change ?? marketData?.quote_symbol?.change) || 0) >= 0
                        ? "#00E396"
                        : "#FF334B",
                  }}
                >
                  {formatNumber(marketData?.price_info?.change ?? marketData?.quote_symbol?.percentChange ?? 0)}
                </div>
              </div>
              <div className="Market__container__volume">
                <div className="Market__stock__volume">Bid Volume</div>
                <div className="Market__stock__volume__value">
                  {formatNumber(
                    Number(marketData?.bid_offer?.bid_volume1 || 0)
                  )}
                </div>
              </div>
              <div className="Market__container__Bid_Price">
                <div className="Market__stock__Bid_Price">Bid Price</div>
                <div
                  className="Market__stock__Bid_Price__value"
                  style={{
                    color:
                      ((marketData?.price_info?.change ?? marketData?.quote_symbol?.percentChange) || 0) >= 0
                        ? "#00E396"
                        : "#FF334B",
                  }}
                >
                  {formatNumber(marketData?.bid_offer?.bid_price1 || 0)}
                </div>
              </div>
              <div className="Market__container__Offer_Price">
                <div className="Market__stock__Offer_Price">Offer Price</div>
                <div
                  className="Market__stock__Offer_Price__value"
                  style={{
                    color:
                      ((marketData?.price_info?.change ?? marketData?.quote_symbol?.percentChange) || 0) >= 0
                        ? "#00E396"
                        : "#FF334B",
                  }}
                >
                  {formatNumber(marketData?.bid_offer?.ask_price1 || 0)}
                </div>
              </div>
              <div className="Market__container__offer_volume">
                <div className="Market__stock__offer_volume">Offer Volume</div>
                <div className="Market__stock__offer_volume__value">
                  {formatNumber(
                    Number(marketData?.bid_offer?.ask_volume1 || 0)
                  )}
                </div>
              </div>
              <div className="Market__container__total_volume">
                <div className="Market__stock__total_volume">Total Volume</div>
                <div className="Market__stock__total_volume__value">
                  {Number(marketData?.price_info?.total_volume ?? marketData?.quote_symbol?.totalVolume ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="Market__container__mid__header__Lower">
          <div className="Market__container__mid__header__Lower__width">
            <span className="Market__stock__High">High</span>
            <span
              className="Market__stock__High__value"
              style={{
                color: "#00E396",
              }}
            >
              {formatNumber(marketData?.price_info?.high ?? marketData?.quote_symbol?.high ?? 0)}
            </span>
            <span className="Market__stock__Low">Low</span>
            <span
              className="Market__stock__Low__value"
              style={{
                color: "#FF334B",
              }}
            >
              {formatNumber(marketData?.price_info?.low ?? marketData?.quote_symbol?.low ?? 0)}
            </span>
            <span className="Market__stock__Open">Ceiling</span>
            <span
              className="Market__stock__Open__value"
              style={{
                color: "#00E396",
              }}
            >
              {formatNumber(
                (marketData?.price_info?.open ?? marketData?.candlestick_1limit?.open?.[0])
                  ? (marketData?.price_info?.open ?? marketData.candlestick_1limit.open[0]) * 1.3
                  : 0
              )}
            </span>
            <span className="Market__stock__floor">Floor</span>
            <span
              className="Market__stock__floor__value"
              style={{
                color: "#FF334B",
              }}
            >
              {formatNumber(
                (marketData?.price_info?.open ?? marketData?.candlestick_1limit?.open?.[0])
                  ? (marketData?.price_info?.open ?? marketData.candlestick_1limit.open[0]) * 0.7
                  : 0
              )}
            </span>
            <span className="Market__stock__Average">Average</span>
            <span className="Market__stock__Average__value">
              {formatNumber(marketData?.price_info?.last ?? marketData?.quote_symbol?.average ?? 0)}
            </span>
            <span className="Market__stock__Close">Close</span>
            <span className="Market__stock__Close__value">
              {formatNumber(
                marketData?.price_info?.close ?? marketData?.candlestick_1limit?.close?.[0] ?? 0
              )}
            </span>
          </div>
        </div>
        <div className="Market__chart__toolbar">
          {INTERVAL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`Market__chart__interval__btn ${selectedInterval === preset.label ? "active" : ""
                }`}
              onClick={() => handleIntervalChange(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <LoadingOverlay
          active={isLoadingGraph}
          spinner
          className="Market__container__Graph"
        >
          {(() => {
            const chartData =
              marketData?.candlestick_50limit || (marketData?.close ? marketData : null);
            return chartData ? (
              <CandleChart data={chartData} interval={selectedInterval} />
            ) : null;
          })()}
        </LoadingOverlay>
        <div className="Market__container__mid__Footer">
          <div className="Market__container__mid__Footer__width">
            <div className="Market__container__mid__Footer__left">
              <div className="Market__Accont__Dropdawn">
                <div className="Market__Accont">
                  Account
                  <span className="Market__Accont__value">
                    {userAccount.id}
                  </span>
                </div>
              </div>
              <div className="Market__Accont__Credit__limit">
                Credit Limit
                <span className="Market__Accont__Credit__limit__value">
                  {formatNumber(
                    userAccount.credit_limit ? userAccount.credit_limit : 0
                  )}
                </span>
              </div>
              <div className="Market__Accont__Cash__balance">
                Cash Balance
                <span className="Market__Accont__Cash__balance__value">
                  {formatNumber(
                    userAccount.cash_balance ? userAccount.cash_balance : 0
                  )}
                </span>
              </div>
              <div className="Market__Accont__Line_Available">
                Line Available
                <span className="Market__Accont__Line_Available__value">
                  {formatNumber(
                    userAccount.line_available ? userAccount.line_available : 0
                  )}
                </span>
              </div>
            </div>

            <div className="Market__container__mid__Footer__mid">
              <div className="Market__Footer__Symbol">
                Symbol
                <span className="Market__Footer__Symbol__value">{symbol}</span>
              </div>
              <div
                className="Market__Footer__Price"
                style={{ borderColor: inputBorderColor1 }}
              >
                Price
                <span className="Market__Footer__Price__value">
                  <NumericFormat
                    value={Price}
                    decimalScale={2}
                    fixedDecimalScale
                    thousandSeparator=","
                    placeholder="THB"
                    onFocus={handleInputFocus1}
                    onBlur={handleInputBlur1}
                    onChange={(e) => setPrice(e.target.value.replace(/,/g, ""))}
                  />
                </span>
              </div>
              <div
                className="Market__Footer__Volume"
                style={{ borderColor: inputBorderColor2 }}
              >
                Volume
                <span className="Market__Footer__Volume__value">
                  <NumericFormat
                    value={Volume}
                    thousandSeparator=","
                    placeholder="Unit"
                    onFocus={handleInputFocus2}
                    onBlur={handleInputBlur2}
                    onChange={(e) => {
                      setVolume(e.target.value.replace(/,/g, ""));
                    }}
                  />
                </span>
              </div>

              <button
                className="Market__Footer__Reset__Order"
                onClick={handleResetClick}
              >
                Reset
              </button>
            </div>
            <div className="Market__container__mid__Footer__right">
              <div className="Market__Footer__Total">
                Total
                <span className="Market__Footer__Total__value">
                  {totalPrice.toLocaleString()}
                </span>
              </div>
              <div
                className="Market__Footer__Pin"
                style={{ borderColor: inputBorderColor3 }}
              >
                Pin
                <span className="Market__Footer__Pin__value">
                  <PatternFormat
                    value={Pin}
                    format="# # # # # #"
                    allowEmptyFormatting
                    mask="_"
                    onFocus={handleInputFocus3}
                    onBlur={handleInputBlur3}
                    onChange={(e) => setPin(e.target.value.replace(/ /g, ""))}
                  />
                </span>
              </div>

              <div className="Market__Footer__Order">
                <div className="Market__Footer__Order__div">
                  <div
                    className={`Market__Footer__Buy ${selectedOption === "Buy" ? "active" : ""
                      }`}
                    onClick={() => handleOptionClick("Buy")}
                  >
                    <button
                      className={selectedOption === "Buy" ? "activeBuy" : ""}
                    >
                      Buy
                    </button>
                  </div>
                  <div
                    className={`Market__Footer__Sell ${selectedOption === "Sell" ? "active" : ""
                      }`}
                    onClick={() => handleOptionClick("Sell")}
                  >
                    <button
                      className={selectedOption === "Sell" ? "activeSell" : ""}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="Market__Footer__Place__Order"
                onClick={handleOrderClick}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="Market__container__right">
        <div className="Market__container__right__Container">
          <div className="Market__container__right__div">
            <div className="Market__container__right__Container__Top">
              <div className="Market__container__right__Header__top">
                Popular
              </div>
              <div className="Market__container__right__top__header__container">
                <div className="Market__container__right__top__header__Symbol">
                  Symbol
                </div>
                <div className="Market__container__right__top__header__Price">
                  Last Price
                </div>
                <div className="Market__container__right__top__header__Change">
                  Change
                </div>
              </div>
              <div className="Market__container__right__Container__stock">
                <div className="Market__container__stock__box">
                  <div className="Market__container__stock__div">
                    {userStock.map((stock, index) => (
                      <div
                        key={index}
                        className="Market__container__right__Container__box1"
                        style={{
                          color: stock.change >= 0 ? "#00E396" : "#FF334B",
                        }}
                      >
                        <div className="Market__container__right__stock__Symbol">
                          {stock.symbol}
                        </div>
                        <div className="Market__container__right__stock__Price">
                          {stock.close.toFixed(2)}
                        </div>
                        <div className="Market__container__right__stock__Change">
                          {stock.change > 0
                            ? `+${stock.change.toFixed(2)}`
                            : `${stock.change.toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="Market__container__right__Container__Bottom">
              <div className="Market__container__right__Header__bottom">
                Your Order
              </div>
              <div className="Market__container__right__Bottom__header__container">
                <div className="Market__container__right__Bottom__header__Symbol">
                  Symbol
                </div>
                <div className="Market__container__right__Bottom__header__Side">
                  Side
                </div>
                <div className="Market__container__right__Bottom__header__Price">
                  Price
                </div>
                <div className="Market__container__right__Bottom__header__Volume">
                  Volume
                </div>
                <div className="Market__container__right__Bottom__header__Status">
                  Status
                </div>
              </div>
              <div className="Market__container__right__Container__stock">
                <div className="Market__container__stock__box">
                  {userOrder ? (
                    <div className="Market__container__stock__div">
                      {userOrder.map((stock, index) => (
                        <button
                          onClick={
                            stock.status === "C"
                              ? () => { }
                              : () => togglePopup(stock)
                          }
                          key={index}
                          className={`Market__container__right__Container__box2 ${selectedStock === stock ? "selected" : ""
                            }`}
                        >
                          <div className="Market__container__right__status__Symbol">
                            {stock.symbol}
                          </div>
                          <div className="Market__container__right__stock__Side">
                            {stock.side === "Buy" ? "B" : "S"}
                          </div>
                          <div className="Market__container__right__status__Price">
                            {stock.price.toFixed(2)}
                          </div>
                          <div className="Market__container__right__status__Volume">
                            {stock.volume}
                          </div>
                          <div className="Market__container__right__status__Status">
                            {stock.status}
                          </div>
                        </button>
                      ))}{" "}
                      <div className="PopUP">
                        {isPopupOpen && (
                          <PopUP
                            pin={cancelPin}
                            handlePinChange={handlePinChange}
                            selectedStock={selectedStock.symbol}
                            handleCancelOrder={handleCancelOrder}
                            handleOkClick={handleOkClick}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSearchModalOpen && (
        <div className="Market__search__modal__overlay" onClick={() => setIsSearchModalOpen(false)}>
          <div className="Market__search__modal__content" onClick={(e) => e.stopPropagation()}>
            <div className="Market__search__modal__header">
              <div className="Market__search__modal__input__wrap">
                <i className="bx bx-search"></i>
                <input
                  type="text"
                  placeholder="Search stock symbol (e.g. KBANK, DELTA, PTT...)"
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <button
                className="Market__search__modal__close"
                onClick={() => setIsSearchModalOpen(false)}
              >
                <i className="bx bx-x"></i>
              </button>
            </div>

            <div className="Market__search__modal__body">
              <div className="Market__search__modal__subtitle">Select a Stock Symbol</div>
              <div className="Market__search__modal__grid">
                {filteredStocks.map((stk, idx) => (
                  <div
                    key={idx}
                    className={`Market__search__modal__item ${stk.symbol === symbol ? "active" : ""}`}
                    onClick={() => {
                      setSymbol(stk.symbol);
                      setIsSearchModalOpen(false);
                      setModalSearchTerm("");
                    }}
                  >
                    <div className="Market__search__modal__item__sym">{stk.symbol}</div>
                    <div className="Market__search__modal__item__right">
                      <div className="Market__search__modal__item__price">
                        {stk.close ? stk.close.toFixed(2) : stk.price ? stk.price.toFixed(2) : "--"}
                      </div>
                      <div
                        className="Market__search__modal__item__chg"
                        style={{ color: (stk.change || 0) >= 0 ? "#00E396" : "#FF334B" }}
                      >
                        {(stk.change || 0) > 0 ? `+${stk.change.toFixed(2)}` : (stk.change || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


