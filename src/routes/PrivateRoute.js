import React, {useContext} from 'react';
import {AuthContext} from "../providers/auth/AuthProvider";
import {Redirect, Route} from "react-router";

const PrivateRoute = ({ component: Component, ...otherProps }) => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated) {
        return <Route {...otherProps} render={props => <Component {...props} />}/>;
    }

    return <Redirect to="/login" />;
};

export default PrivateRoute;
