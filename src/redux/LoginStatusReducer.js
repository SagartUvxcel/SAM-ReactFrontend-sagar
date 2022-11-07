const initialSate = false;
const ChangeStatus = (state = initialSate, action) => {
  if (action.type === "loggedIn") {
    localStorage.setItem("isLoggedIn", action.payload);
    return action.payload;
  } else {
    return state;
  }
};
export default ChangeStatus;
