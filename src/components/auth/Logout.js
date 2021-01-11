import React, {useContext, useEffect} from 'react';
import {AuthContext} from "../../providers/auth/AuthProvider";
import {Redirect} from "react-router";

const Logout = () => {
    const { logout } = useContext(AuthContext);

    useEffect(logout, []);

    return <Redirect to={'/login'} />;
};

export default Logout;
