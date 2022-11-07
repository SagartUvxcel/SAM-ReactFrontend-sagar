const initialSate = false;
const ChangeStatus = (state = initialSate, action) => {
  switch (action.type) {
    case "loggedIn":
      return action.payload;
    default:
      return state;
  }
};
export default ChangeStatus;
