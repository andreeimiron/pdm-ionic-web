import React, {createContext, useCallback, useEffect, useReducer} from 'react';

import * as types from '../api/constants';
import {DELETE_CAR_SUCCESS, GET_CARS_ERROR, SAVE_CAR_SUCCESS} from '../api/constants';
import {addTv, deleteTvById, getTvs, newWebSocket, updateTvById} from '../api';

const initialState = {
    tvs: [],
    loading: false,
    requestError: null,
};

const updateObject = (object, otherProps) => ({
    ...object,
    ...otherProps,
});

const addOrUpdateTv = (tvs, tv) => {
    const index = tvs.findIndex(item => item.id === tv.id);

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
        case types.GET_CARS_PENDING:
            return updateObject(state, { loading: true, requestError: null });
        case types.GET_CARS_SUCCESS:
            return updateObject(state, { loading: false, tvs: payload.tvs });
        case types.GET_CARS_ERROR:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.SAVE_CAR_PENDING:
            return updateObject(state, { loading: true, requestError: null });
        case types.SAVE_CAR_SUCCESS: {
            const tvsClone = [...(state.tvs || [])];
            const {tv} = payload;
            const newTvs = addOrUpdateTv(tvsClone, tv);

            return updateObject(state, {loading: false, tvs: newTvs});
        }
        case types.SAVE_CAR_ERROR:
            return updateObject(state, { loading: false, requestError: payload.error });
        case types.DELETE_CAR_PENDING:
            return updateObject(state, { loading: true, requestError: null });
        case types.DELETE_CAR_SUCCESS: {
            const tvsClone = [...(state.tvs || [])];
            const {tv} = payload;
            const newTvs = tvsClone.filter(item => item.id !== tv.id);

            return updateObject(state, {loading: false, tvs: newTvs});
        }
        case types.DELETE_CAR_ERROR:
            return updateObject(state, { loading: false, requestError: payload.error });
    }
};

export const TvContext = createContext(initialState);

export const TvProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { tvs, loading, requestError } = state;

    useEffect(() => {
        let canceled = false;
        const fetchTvs = async () => {
            try {
                dispatch({type: types.GET_CARS_PENDING});
                const fetchedTvs = await getTvs();

                if (!canceled) {
                    dispatch({ type: types.GET_CARS_SUCCESS, payload: { tvs: fetchedTvs } });
                }
            } catch (err) {
                dispatch({ type: GET_CARS_ERROR, payload: { error: err.error }});
            }
        };

        fetchTvs();
        return () => {
            canceled = true;
        }
    }, []);

    useEffect(() => {
        let canceled = false;

        const closeWebSocket = newWebSocket((message) => {
            if (canceled) {
                return;
            }

            const { action, payload: { tv } } = message;

            if ( action === 'create' || action === 'update') {
                dispatch({ type: SAVE_CAR_SUCCESS, payload: { tv } });
            }
            if (action === 'delete') {
                dispatch({ type: DELETE_CAR_SUCCESS, payload: { tv } });
            }
        });

        return () => {
            canceled = true;
            closeWebSocket();
        };
    }, []);

    const saveTvCallback = async (tv) => {
        const apiMethod = !tv.id ? addTv : updateTvById;

        try {
            dispatch({ type: types.SAVE_CAR_PENDING });
            const newTv = await apiMethod(tv);

            dispatch({ type: types.SAVE_CAR_SUCCESS, payload: { tv: newTv } });
        } catch (err) {
            dispatch({ type: types.SAVE_CAR_ERROR, payload: { error: err.error } });
        }
    };

    const deleteTvCallback = async (id) => {
        try {
            dispatch({ type: types.DELETE_CAR_PENDING });
            await deleteTvById(id);

            dispatch({ type: types.DELETE_CAR_SUCCESS, payload: { tv: { id } } });
        } catch (err) {
            dispatch({ type: types.DELETE_CAR_ERROR, payload: { error: err.error } });
        }
    };

    const saveTv = useCallback(saveTvCallback, []);
    const deleteTv = useCallback(deleteTvCallback, []);
    const value = { tvs, loading, requestError, saveTv, deleteTv };

    return (
        <TvContext.Provider value={value}>
            {children}
        </TvContext.Provider>
    );
}
