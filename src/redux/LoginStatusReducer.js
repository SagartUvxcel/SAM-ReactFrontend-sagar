const initialSate = false;
const ChangeStatus = (state = initialSate, action) => {
  if (action.type === "loggedIn") {
    localStorage.setItem("isLoggedIn", action.payload);
    return action.payload;
  } else {
    return state;
  }
  // switch (action.type) {
  //   case "loggedIn":
  //     return action.payload;
  //   default:
  //     return state;
  // }
};
export default ChangeStatus;
