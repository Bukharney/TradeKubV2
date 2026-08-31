import axiosClient from "./axiosClient";
import { handleLogin as authHandleLogin } from "./services/auth.service";
import {
  cancelOrder as stockCancelOrder,
  placeOrder as stockPlaceOrder,
  searchStock,
  getOrdersByAccount,
} from "./services/stock.service";

export const handleLogin = async (data) => {
  const result = await authHandleLogin(data);
  return result.success;
};

export const cancelOrder = async (
  id,
  cancelPin,
  setUserOrder,
  Account
) => {
  const res = await stockCancelOrder(id, cancelPin);
  if (res.success) {
    alert("Cancle order successfull");
    if (Account?.account) {
      const orderRes = await getOrdersByAccount(Account.account);
      if (orderRes.success && setUserOrder) {
        setUserOrder(orderRes.data);
      }
    }
  } else {
    alert("Cancle order failed please try again");
  }
};

export const placeOrder = async (data, Token, Account) => {
  const res = await stockPlaceOrder(data);
  if (res.success) {
    alert("Order successfull");
    if (Account?.account) {
      const orderRes = await getOrdersByAccount(Account.account);
      if (orderRes.success) {
        return orderRes.data;
      }
    }
  } else {
    alert("Order failed please try again");
  }
};

export const getSearchStock = async (symbol, Token) => {
  const res = await searchStock(symbol);
  if (res.success) {
    return res.data;
  }
};

export { axiosClient };

