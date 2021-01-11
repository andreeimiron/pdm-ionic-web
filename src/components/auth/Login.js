import React, {useContext, useState} from 'react';
import {AuthContext} from "../../providers/auth/AuthProvider";
import {Redirect} from "react-router";
import {IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLoading, IonInput, IonButton} from "@ionic/react";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);

    const handleLogin = () => login(username, password);

    if (isAuthenticated) {
        return <Redirect to="/" />;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={(e) => setUsername(e.detail.value)}
                />
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value)}
                    type="password"
                />
                <IonLoading isOpen={isAuthenticating} />
                {authenticationError && (
                    <div>{authenticationError}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
};

export default Login;
