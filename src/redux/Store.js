import { combineReducers } from "redux";
import ChangeStatus from "./LoginStatusReducer";
import { createStore } from "redux";

const rootReducer = combineReducers({ login_status: ChangeStatus });
const store = createStore(rootReducer);
export default store;
