import React from 'react';
import { IonContent, IonToast } from "@ionic/react";
import { useNetwork } from "../hooks/useNetwork";

const NetworkWrapper = ({ children }) => {
    const { networkStatus } = useNetwork();
    const isOnline = networkStatus.connected;

    return (
        <IonContent>
            <IonToast
                isOpen={!isOnline}
                message="Connection lost! You are offline!"
                position="top"
                color="danger"
            />
            {children}
        </IonContent>
    );
};

export default NetworkWrapper;
