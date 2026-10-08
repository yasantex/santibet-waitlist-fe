import { combineReducers, configureStore } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import campaignSlice from './campaignSlice'

const rootReducer = combineReducers({
  campaign: campaignSlice,
  // other reducers would go here
})

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root', // key is required
  storage, // storage engine
  // Merge into each slice, so fields added since a device last saved keep their initial value.
  stateReconciler: autoMergeLevel2,
  // You can also specify which reducers to persist:
  // whitelist: ['user'] // only user reducer will be persisted
  //   blacklist: ['employee'], // employeeSlice will not be persisted
}

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
