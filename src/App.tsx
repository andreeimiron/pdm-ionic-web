import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import TvList from "./components/TvList";
import TvForm from "./components/TvForm";
import {TvProvider} from "./components/TvProvider";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

const App: React.FC = () => (
    <IonApp>
        <TvProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route exact path="/tvs" component={TvList}/>
                    <Route exact path="/tv" component={TvForm}/>
                    <Route exact path="/tv/:id" component={TvForm}/>
                    <Route exact path="/" render={() => <Redirect to="/tvs"/>}/>
                </IonRouterOutlet>
            </IonReactRouter>
        </TvProvider>
    </IonApp>
);

export default App;
