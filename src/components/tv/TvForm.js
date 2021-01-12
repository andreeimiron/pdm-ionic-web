import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton, IonButtons, IonContent, IonHeader, IonInput,
    IonLoading, IonPage, IonTitle, IonToolbar, IonDatetime,
    IonCheckbox, IonLabel, IonItem, IonImg, IonRow, IonCol,
    createAnimation
} from '@ionic/react';
import {TvContext} from "../../providers/tv/TvProvider";
import {useNetwork} from "../../hooks/useNetwork";
import {usePhotoGallery} from "../../hooks/usePhotoGallery";
import {useMyLocation} from "../../hooks/useMyLocation";
import {Map} from "../map/Map";
import {get} from 'lodash';

const TvForm = ({ history, match }) => {
    const { tvs, loading, requestError, saveTv, deleteTv, offlineMessage } = useContext(TvContext);
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

    const groupAnimations = () => {
        const firstElem = document.querySelector('.buttons');
        const secondElem = document.querySelector('.title');

        if (firstElem && secondElem) {
            const animationA = createAnimation()
                .addElement(firstElem)
                .fromTo('transform', 'scale(1)', 'scale(1.25)');

            const animationB = createAnimation()
                .addElement(secondElem)
                // .fromTo('transform', 'scale(1)', 'scale(0.75)');
                .fromTo('transform', 'translateX(0)', 'translateX(45vw)')
            const parentAnimation = createAnimation()
                .duration(5000)
                .addAnimation([animationA, animationB]);

            parentAnimation.play();    }
    }

    useEffect(groupAnimations, [])

    useEffect(() => {
        const { id } = match.params;

        if (!id) {
            return;
        }

        const currentTv = tvs.find(item => item._id === id);

        setTv(currentTv);
        if (currentTv) {
            const { lat, lng } = currentTv;

            setManufacturer(currentTv.manufacturer);
            setModel(currentTv.model);
            setFabricationDate(currentTv.fabricationDate);
            setPrice(currentTv.price);
            setIsSmart(currentTv.isSmart);
            setPhoto(currentTv.photo);
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

        await saveTv(inputData, isOnline);
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
                    <IonTitle className="title">{tv ? 'Edit Tv' : 'Add New Tv'}</IonTitle>
                    <IonButtons slot="end" className="buttons">
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
                <IonRow>
                    {photo ? <IonImg src={photo} style={{ width: 300, height: 'auto' }}/> : <IonImg src='https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg' style={{ width: 300, height: 'auto' }}/>}
                    <IonCol>
                        <IonItem className="logout" >
                            <IonLabel >Manufacturer</IonLabel>
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
                            <IonLabel>Price</IonLabel>
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
                        <IonRow>
                            <IonButton id="take-photo-btn" style={{ margin: 20 }} onClick={handleTakePhoto}>
                                Take photo
                            </IonButton>
                            {photo && (
                                <IonButton color="danger" style={{ margin: 20 }} onClick={handleDeletePhoto}>
                                    Delete photo
                                </IonButton>
                            )}
                        </IonRow>
                    </IonCol>
                    {coords.lat && coords.lng && (
                        <Map
                            lat={coords.lat}
                            lng={coords.lng}
                            onMapClick={onMapClick}
                            onMarkerClick={(e) => console.log('marker click', e)}
                        /> )}
                </IonRow>

            </IonContent>
        </IonPage>
    );
};

export default TvForm;
