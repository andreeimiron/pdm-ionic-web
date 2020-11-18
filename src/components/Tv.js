import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';

const Tv = ({ text, onEdit }) => {
    return (
        <IonItem onClick={onEdit}>
            <IonLabel>
                {text}
            </IonLabel>
        </IonItem>
    );
};

export default Tv;
