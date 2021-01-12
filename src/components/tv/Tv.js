import React from 'react';
import {IonItem, IonLabel, IonThumbnail, IonImg} from '@ionic/react';

const Tv = ({ text, photo, onEdit }) => {
    if (!photo) {
        photo = 'https://www.allianceplast.com/wp-content/uploads/2017/11/no-image.png';
    }

    return (
        <IonItem onClick={onEdit}>
            <IonThumbnail>
                <IonImg src={photo} />
            </IonThumbnail>
            <IonLabel style={{ marginLeft: 10 }}>
                {text}
            </IonLabel>
        </IonItem>
    );
};

export default Tv;
