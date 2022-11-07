export const checkStatus = (statusOfLogin) => {
  return { type: "loggedIn", payload: statusOfLogin };
};
