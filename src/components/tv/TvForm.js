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
    IonImg
} from '@ionic/react';
import {TvContext} from "../../providers/tv/TvProvider";
import {useNetwork} from "../../hooks/useNetwork";
import {usePhotoGallery} from "../../hooks/usePhotoGallery";
import {useMyLocation} from "../../hooks/useMyLocations";
import {MyMap} from "../map/MyMap";
import {get} from 'lodash';

const TvForm = ({ history, match }) => {
    const { tvs, loading, requestError, saveTv, deleteTv } = useContext(TvContext);
    const [tv, setTv] = useState(null);
    const [manufacturer, setManufacturer] = useState('');
    const [model, setModel] = useState('');
    const [fabricationDate, setFabricationDate] = useState('');
    const [price, setPrice] = useState(0);
    const [isSmart, setIsSmart] = useState(false);
    const [photo, setPhoto] = useState(null)
    const [coords, setCoords] = useState({ lat: null, lng: null });

    const { networkStatus } = useNetwork();
    const isOnline = networkStatus.connected;
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const myLocation = useMyLocation(isOnline);

    useEffect(() => {
        const photoBtnElem = document.getElementById('take-photo-btn');
        const manufacturerInputElem = document.getElementById('manufacturer-input');
        const modelInputElem = document.getElementById('model-input');
        const manufacturerLabelElem = document.getElementById('manufacturer-label');
        const modelLabelElem = document.getElementById('model-label');

        // ANIMATIONS
    }, [])

    useEffect(() => {
        const { id } = match.params;

        if (!id) {
            return;
        }

        const currentTv = tvs.find(item => item._id === id);

        setTv(currentTv);
        if (currentTv) {
            const { lat, lng } = currentCar;

            setManufacturer(currentTv.manufacturer);
            setModel(currentTv.model);
            setFabricationDate(currentTv.fabricationDate);
            setPrice(currentTv.price);
            setIsSmart(currentTv.isSmart);
            setPhoto(currentCar.photo);
            setCoords({ lat, lng });
        }
    }, [match.params.id, tvs]);

    useEffect(() => {
        if (!coords.lat && !coords.lng) {
            const lat = get(myLocation, 'position.coords.latitude', null);
            const lng = get(myLocation, 'position.coords.longitude', null);

            setCoords({ lat, lng })
        }
    }, [myLocation]);

    const handleDelete = async () => {
        await deleteTv(tv._id);
        goBack();
    };

    const handleSave = async () => {
        const inputData = {
            manufacturer,
            model,
            fabricationDate,
            price,
            isSmart,
            photo,
            lat: coords.lat,
            lng: coords.lng,
            version: 1,
        };

        if (tv) {
            inputData._id = tv._id;
            inputData.version = tv.version || 1;
        }

        await saveTv(inputData);
    };

    const goBack = () => {
        history.push('/tvs');
    };

    const handleTakePhoto = async () => {
        const takenPhoto = await takePhoto();
        setPhoto(takenPhoto.src);
    };

    const handleDeletePhoto = async () => {
        const storedPhoto = photos.find(p => p.webviewPath === photo);

        if (storedPhoto) {
            await deletePhoto(storedPhoto);
        }
        setPhoto(null);
    };

    const onMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setCoords({ lat, lng });
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
                {offlineMessage && <IonLabel color="primary">{offlineMessage}</IonLabel>}
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
                    <IonLabel>Fabrication date</IonLabel>
                    <IonDatetime
                        value={fabricationDate}
                        onIonChange={(e) => setFabricationDate(e.detail.value)}
                        placeholder="Enter date.."
                        type="date"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Horse power</IonLabel>
                    <IonInput
                        value={price}
                        onIonChange={(e) => setPrice(e.detail.value)}
                        placeholder="ex: 499"
                        type="number"
                        min={0}
                        max={1000}
                        slot="end"
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Is Smart</IonLabel>
                    <IonCheckbox
                        checked={isSmart}
                        onIonChange={(e) => setIsSmart(e.detail.checked)}
                    />
                </IonItem>
                <IonButton id="take-photo-btn" style={{ margin: 20 }} onClick={handleTakePhoto}>
                    Take photo
                </IonButton>
                {photo && (
                    <IonButton color="danger" style={{ margin: 20 }} onClick={handleDeletePhoto}>
                        Delete photo
                    </IonButton>
                )}
                <IonItem style={{ margin: 20 }}>
                    {photo ? <IonImg src={photo} style={{ width: 600, height: 'auto' }}/> : <IonLabel>No photo</IonLabel>}
                </IonItem>

                {coords.lat && coords.lng && (
                    <MyMap
                        lat={coords.lat}
                        lng={coords.lng}
                        onMapClick={onMapClick}
                        onMarkerClick={(e) => console.log('marker click', e)}
                    />
                )}
            </IonContent>
        </IonPage>
    );
};

export default TvForm;
