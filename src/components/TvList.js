import React, {useContext, useEffect, useState} from 'react';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Tv from "./Tv";
import {TvContext} from "./TvProvider";

const ItemList = ({ history }) => {
    const { tvs, loading, requestError } = useContext(TvContext);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Tv Shop</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={loading} message="Loading tvs.." />
                {tvs && (
                    <IonList>
                        {tvs.map(({ id, manufacturer, model }) =>
                            <Tv
                                key={`tv-list-item-${id}`}
                                text={`${manufacturer} ${model}`}
                                onEdit={() => history.push(`/tv/${id}`)}
                            />
                        )}
                    </IonList>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/tv')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
            {requestError && <IonLabel color={"danger"}>{requestError}</IonLabel>}
        </IonPage>
    );
};

export default ItemList;
