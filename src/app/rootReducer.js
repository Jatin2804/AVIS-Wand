import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";

const rootReducer = combineReducers({
  users: userReducer,
});

export default rootReducer;
