import { configureStore } from "@reduxjs/toolkit";
import voiceReducer from "../Slices/voice.slice";

export const StoreCustom = configureStore({
  reducer: {
    voice: voiceReducer,
  },
});

export type RootState = ReturnType<typeof StoreCustom.getState>;
export type AppDispatch = typeof StoreCustom.dispatch;
