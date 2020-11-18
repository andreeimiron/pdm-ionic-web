import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonDatetime,
    IonCheckbox,
    IonLabel,
    IonItem,
} from '@ionic/react';
import {TvContext} from "./TvProvider";

const TvForm = ({ history, match }) => {
    const { tvs, loading, requestError, saveTv, deleteTv } = useContext(TvContext);
    const [tv, setTv] = useState(null);
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
    const [isSmart, setIsSmart] = useState(false);
    const [fabricationDate, setFabricationDate] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (!match.params.id) {
            return;
        }

        const tvId = parseInt(match.params.id);
        const currentTv = tvs.find(item => item.id === tvId);

        setTv(currentTv);
        if (currentTv) {
            setManufacturer(currentTv.manufacturer);
            setModel(currentTv.model);
            setIsSmart(currentTv.isSmart);
            setFabricationDate(currentTv.fabricationDate);
            setPrice(currentTv.price);
        }
    }, [match.params.id, tvs]);

    const handleDelete = async () => {
        await deleteTv(tv.id);
        goBack();
    };

    const handleSave = async () => {
        const inputData = {
            manufacturer,
            model,
            isSmart,
            fabricationDate,
            price,
        };

        if (tv) {
            inputData.id = tv.id;
        }

        await saveTv(inputData);
    };

    const goBack = () => {
        history.push('/tvs');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={goBack}>
                            Back
                        </IonButton>
                    </IonButtons>
                    <IonTitle>{tv ? 'Edit Tv' : 'Add New Tv'}</IonTitle>
                    <IonButtons slot="end">
                        {tv && (
                            <IonButton color="danger" onClick={handleDelete}>
                                Delete
                            </IonButton>
                        )}
                        <IonButton color="primary" onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={loading} />
                {requestError && <IonLabel color="danger">{requestError}</IonLabel>}
                <IonItem>
                    <IonLabel>Manufacturer</IonLabel>
                    <IonInput
                        value={manufacturer}
                        onIonChange={(e) => setManufacturer(e.detail.value)}
                        placeholder="ex: SAMSUNG"
                        type="text"
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Model</IonLabel>
                    <IonInput
                        value={model}
                        onIonChange={(e) => setModel(e.detail.value)}
                        placeholder="ex: 50TUS7005"
                        type="text"
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Smart TV</IonLabel>
                    <IonCheckbox
                        checked={isSmart}
                        onIonChange={(e) => setIsSmart(e.detail.checked)}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Fabrication date</IonLabel>
                    <IonDatetime
                        value={fabricationDate}
                        onIonChange={(e) => setFabricationDate(e.detail.value)}
                        placeholder="ex: 10-02-2020"
                        type="date"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Price</IonLabel>
                    <IonInput
                        value={price}
                        onIonChange={(e) => setPrice(e.detail.value)}
                        placeholder="ex: 499"
                        type="number"
                        min={1}
                        max={999999}
                        slot="end"
                    />
                </IonItem>
            </IonContent>
        </IonPage>
    );
};

export default TvForm;
