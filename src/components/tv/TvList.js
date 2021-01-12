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
    IonButtons,
    IonButton,
    IonInput,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCheckbox,
    IonItem,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    createAnimation
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Tv from "./Tv";
import {TvContext} from "../../providers/tv/TvProvider";
import { debounce } from 'lodash';

const DEFAULT_FILTERS = {
    hasStartDate: false,
    startDate: null,
    hasEndDate: false,
    endDate: null,
    type: 'all',
};

const ItemList = ({ history }) => {
    const { tvs, loading, requestError, loadMore, page, totalPages, search, onSearchChange } = useContext(TvContext);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const onChange = debounce((event) => {
        onSearchChange(event.detail.value, filters);
    }, 500);

    const onScroll = (event) => {
        loadMore();
        event.target.complete();
    };

    const setHasDate = (e, prop) => {
        setFilters({
            ...filters,
            [prop]: e.detail.checked,
        })
    }

    const setDate = (e, prop) => {
        setFilters({
            ...filters,
            [prop]: e.detail.value,
        })
    }

    const setType = (e) => {
        setFilters({
            ...filters,
            type: e.detail.value,
        })
    };

    const simpleAnimation = () => {
        const el = document.querySelector('.add-button');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    { offset: 0, transform: 'scale(1.2)', opacity: '1' },
                    {offset: 1, transform: 'scale(1)', opacity: '0.7'}
                ]);
            animation.play();
        }
    }

    const chainAnimations = () => {
        const firstElem = document.querySelector('.title');
        const secondElem = document.querySelector('.logout');

        if (firstElem && secondElem) {
            const animationA = createAnimation()
                .addElement(firstElem)
                .delay(1000)
                .duration(4000)
                .fromTo('transform', 'translateX(0)', 'translateX(45vw)')
                .afterStyles({
                    'text-shadow': '0px 0px 3px blue'
                });

            const animationB = createAnimation()
                .addElement(secondElem)
                .duration(2000)
                .direction('alternate')
                .keyframes([
                    { offset: 0, transform: 'scale(1))', opacity: '1' },
                    { offset: 0.5, transform: 'scale(1.3)', opacity: '1' },
                    { offset: 1, transform: 'scale(1)', opacity: '1' }
                ]);

            (async () => {
                await animationA.play();
                await animationB.play();
            })();
        }
    }

    useEffect(() => {
        simpleAnimation();
        // groupAnimations();
        chainAnimations();
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className="title">Black Friday TVs</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => history.push('/logout')} className="logout">
                            Logout
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {requestError && <IonLabel color={"danger"}>{requestError}</IonLabel>}
                <IonLoading isOpen={loading} message="Loading tvs" />
                <IonInput
                    placeholder="Search..."
                    value={search}
                    onIonChange={onChange}
                />
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel>Start date</IonLabel>
                                <IonCheckbox checked={filters.hasStartDate} onIonChange={(e) => setHasDate(e, 'hasStartDate')} />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            <IonItem>
                                <IonDatetime
                                    value={filters.startDate}
                                    onIonChange={(e) => setDate(e, 'startDate')}
                                    placeholder="Select start date"
                                    type="date"
                                    disabled={!filters.hasStartDate}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonItem>
                                <IonLabel>End date</IonLabel>
                                <IonCheckbox checked={filters.hasEndDate} onIonChange={(e) => setHasDate(e, 'hasEndDate')} />
                            </IonItem>
                        </IonCol>
                        <IonCol>
                            <IonItem>
                                <IonDatetime
                                    value={filters.endDate}
                                    onIonChange={(e) => setDate(e, 'endDate')}
                                    placeholder="Select end date"
                                    type="date"
                                    disabled={!filters.hasEndDate}
                                />
                            </IonItem>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonSelect value={filters.type} okText="Okay" cancelText="Dismiss" onIonChange={setType}>
                                <IonSelectOption value="all">All tvs</IonSelectOption>
                                <IonSelectOption value="smart">SMART tvs</IonSelectOption>
                                <IonSelectOption value="nonSmart">Non Smart tvs</IonSelectOption>
                            </IonSelect>
                        </IonCol>
                        <IonCol>
                            <IonButton onClick={() => onSearchChange(search, filters)}>
                                Filter
                            </IonButton>
                            <IonButton color="danger" style={{ marginLeft: 20 }} onClick={() => {
                                setFilters(DEFAULT_FILTERS);
                                onSearchChange(search, null);
                            }}>
                                Reset filters
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
                {tvs && (
                    <IonList>
                        {tvs.map(({ _id, manufacturer, model, photo }) =>
                            <Tv
                                key={`tv-list-item-${_id}`}
                                text={`${manufacturer} ${model}`}
                                photo={photo}
                                onEdit={() => history.push(`/tv/${_id}`)}
                            />
                        )}
                    </IonList>
                )}
                <IonInfiniteScroll
                    onIonInfinite={onScroll}
                    threshold={"20px"}
                    disabled={page === totalPages}
                >
                    <IonInfiniteScrollContent
                        loadingSpinner="circles"
                        loadingText="Loading..."
                    />
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/tv')} className="add-button">
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
