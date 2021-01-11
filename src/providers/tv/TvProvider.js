import React, {createContext, useCallback, useContext, useEffect, useReducer} from 'react';
import * as types from './tvTypes';
import {addTv, deleteTvById, getTvs, newWebSocket, updateTvById} from "../../api/tvApi";
import { updateObject } from "../utils";
import {AuthContext} from "../auth/AuthProvider";
import storageService from "../../utils/StorageService";
import {useNetwork} from "../../hooks/useNetwork";

const TVS_LIMIT = 25;

const initialState = {
    tvs: [],
    loading: false,
    requestError: null,
    page: 1,
    totalPages: 1,
    search: '',
    filters: null,
};

const addOrUpdateTv = (tvs, tv) => {
    const index = tvs.findIndex(item => item._id === tv._id);

    if (index === -1) {
        tvs.push(tv);
    } else {
        tvs[index] = tv;
    }

    return tvs;
};

const reducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case types.FETCH_TVS_STARTED:
            return updateObject(state, { loading: true, requestError: null, offlineMessage: null });
        case types.FETCH_TVS_SUCCEEDED:
            const newTvs = payload.page === 1 ? [...payload.tvs] : [...state.tvs, ...payload.tvs];
            return updateObject(state, { loading: false, tvs: newTvs, page: payload.page, totalPages: payload.totalPages });
        case types.FETCH_TVS_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SAVE_TV_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.SAVE_TV_SUCCEEDED: {
            const tvsClone = [...(state.tvs || [])];
            const {tv, offlineMessage} = payload;
            const newTvs = addOrUpdateTv(tvsClone, tv);

            return updateObject(state, {loading: false, tvs: newTvs, offlineMessage });
        }
        case types.SAVE_TV_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.DELETE_TV_STARTED:
            return updateObject(state, { loading: true, requestError: null });
        case types.DELETE_TV_SUCCEEDED: {
            const tvsClone = [...(state.tvs || [])];
            const {tv, offlineMessage} = payload;
            const newTvs = tvsClone.filter(item => item._id !== tv._id);

            return updateObject(state, {loading: false, tvs: newTvs, offlineMessage});
        }
        case types.DELETE_TV_FAILED:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SET_PAGE:
            return updateObject(state, { page: payload.page });
        case types.SET_SEARCH:
            return updateObject(state, { search: payload.search, filters: payload.filters });
        default:
            return { ...state };
    }
};

export const TvContext = createContext(initialState);

export const TvProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { tvs, loading, requestError, page, totalPages, search, offlineMessage, filters } = state;
    const { token } = useContext(AuthContext);
    const { networkStatus } = useNetwork();

    useEffect(() => {
        let canceled = false;
        const fetchTvs = async () => {
            if (networkStatus.connected) {
                try {
                    if (search && page > 1) {
                        dispatch({ type: types.SET_PAGE, payload: { page: 1 } });
                    }
                    dispatch({type: types.FETCH_TVS_STARTED});
                    const fetchResponse = await getTvs(token, search, page, TVS_LIMIT, filters);
                    console.log('fetchResponse', fetchResponse);

                    if (!canceled) {
                        dispatch({ type: types.FETCH_TVS_SUCCEEDED, payload: { tvs: fetchResponse.items, page, totalPages: fetchResponse.totalPages } });
                    }
                } catch (err) {
                    dispatch({ type: types.FETCH_TVS_FAILED, payload: { error: err.message }});
                }
            } else {
                const searchValue = search.toLowerCase();
                const filteredTvs = tvs.filter(tv => {
                    const tvDescription = `${tv.manufacturer} ${tv.model}`.toLowerCase();

                    return tvDescription.includes(searchValue);
                });
                if (!canceled) {
                    dispatch({ type: types.FETCH_TVS_SUCCEEDED, payload: { tvs: filteredTvs, page: 1, totalPages: 1 } });
                }
            }
        };

        fetchTvs();
        return () => {
            canceled = true;
        }
    }, [token, page, search, networkStatus.connected, filters]);

    useEffect(() => {
        let canceled = false;

        const closeWebSocket = newWebSocket(token, (message) => {
            if (canceled || !networkStatus.connected) {
                return;
            }

            const { action, payload: { tv } } = message;

            if ( action === 'create' || action === 'update') {
                dispatch({ type: types.SAVE_TV_SUCCEEDED, payload: { tv } });
            }
            if (action === 'delete') {
                dispatch({ type: types.DELETE_TV_SUCCEEDED, payload: { tv } });
            }
        });

        return () => {
            canceled = true;
            closeWebSocket();
        };
    }, [token, networkStatus.connected]);

    useEffect(() => {
        if (networkStatus.connected) {
            storageService.sync(saveTv, deleteTv);
        }
    }, [networkStatus.connected]);

    const saveTvCallback = async (tv, isOnline, sync = false) => {
        if (isOnline) {
            const apiMethod = !tv._id ? addTv : updateTvById;

            try {
                dispatch({ type: types.SAVE_TV_STARTED });
                const newTv = await apiMethod(tv, token);

                if (!sync) {
                    dispatch({ type: types.SAVE_TV_SUCCEEDED, payload: { tv: newTv } });
                }
            } catch (err) {
                if (err.versionError) {
                    alert(err.message);
                }
                dispatch({ type: types.SAVE_TV_FAILED, payload: { error: err.message } });
            }
        } else {
            const newTv = await storageService.saveTv(tv);
            const verb = tv._id ? 'updated' : 'added';
            const offlineMessage = `[OFFLINE] Tv ${verb} without syncing with server.`;
            dispatch({ type: types.SAVE_TV_SUCCEEDED, payload: { tv: newTv, offlineMessage } });
        }
    };

    const deleteTvCallback = async (id, isOnline, sync = false) => {
        if (isOnline) {
            try {
                dispatch({ type: types.DELETE_TV_STARTED });
                await deleteTvById(id, token);

                if (!sync) {
                    dispatch({ type: types.DELETE_TV_SUCCEEDED, payload: { tv: { _id: id } } });
                }
            } catch (err) {
                dispatch({ type: types.DELETE_TV_FAILED, payload: { error: err.message } });
            }
        } else {
            await storageService.deleteTv(id);
            const offlineMessage = '[OFFLINE] Tv deleted without syncing with server.';
            dispatch({ type: types.DELETE_TV_SUCCEEDED, payload: { tv: { _id: id }, offlineMessage } });
        }
    };

    const loadMoreCallback = () => {
        console.log('page', page);
        console.log('totalPages', totalPages);
        if (page < totalPages) {
            dispatch({ type: types.SET_PAGE, payload: { page: page + 1 } });
        }
    };

    const onSearchChangeCallback = (value, filters) => {
        dispatch({ type: types.SET_SEARCH, payload: { search: value, filters } });
    };

    const saveTv = useCallback(saveTvCallback, [token]);
    const deleteTv = useCallback(deleteTvCallback, [token]);
    const loadMore = useCallback(loadMoreCallback, [token, page, totalPages]);
    const onSearchChange = useCallback(onSearchChangeCallback, []);
    const value = { tvs, loading, requestError, saveTv, deleteTv, page, totalPages, loadMore, search, onSearchChange, offlineMessage, filters };

    console.log('search', state);
    return (
        <TvContext.Provider value={value}>
            {children}
        </TvContext.Provider>
    );
}
