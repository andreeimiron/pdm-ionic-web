import React, {createContext, useCallback, useEffect, useState} from 'react';
import { login as loginApi } from '../../api/authApi';

const initialState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

const saveStateToLocalStorage = (state) => {
    console.log('state', state);
    localStorage.setItem('authState', JSON.stringify(state));
};

const getStateFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('authState'));
}

const getInitialState = () => {
    const localStorageState = getStateFromLocalStorage();

    return localStorageState || initialState;
};

export const AuthContext = createContext(getInitialState());

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState(getInitialState());
    const { isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token } = state;

    const setExtendedState = (newState) => {
        setState(newState);
        saveStateToLocalStorage(newState);
    };

    const loginCallback = (username, password) => {
        setExtendedState({
            ...state,
            pendingAuthentication: true,
            username,
            password,
        });
    };

    const authenticationEffect = () => {
        let canceled = false;

        const authenticate = async () => {
            if (!pendingAuthentication) {
                return;
            }

            try {
                setExtendedState({
                    ...state,
                    isAuthenticating: true,
                });
                const { username, password } = state;
                const response = await loginApi(username, password);
                const { token } = response;

                if (canceled) {
                    return;
                }

                setExtendedState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (err) {
                console.log('err', err);
                if (canceled) {
                    return;
                }

                setExtendedState({
                    ...state,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                    authenticationError: err.message,
                })
            }
        };

        authenticate();

        return () => {
            canceled = true;
        };
    };

    const logoutCallback = () => {
        setExtendedState({
            ...state,
            token: '',
            isAuthenticated: false,
        })
    };

    const login = useCallback(loginCallback, []);
    useEffect(authenticationEffect, [pendingAuthentication]);
    const logout = useCallback(logoutCallback, []);
    const value = { isAuthenticated, login, logout, isAuthenticating, authenticationError, token };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
