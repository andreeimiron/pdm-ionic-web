import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import TvList from "./components/tv/TvList";
import TvForm from "./components/tv/TvForm";
import {TvProvider} from "./providers/tv/TvProvider";
import {AuthProvider} from "./providers/auth/AuthProvider";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import PrivateRoute from './routes/PrivateRoute';

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
import NetworkWrapper from "./utils/NetworkWrapper";

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
            <IonRouterOutlet>
                <NetworkWrapper>
                    <AuthProvider>
                        <Route exact path="/login" component={Login}/>
                        <Route exact path="/logout" component={Logout}/>
                        <TvProvider>
                            <PrivateRoute exact path="/tvs" component={TvList}/>
                            <PrivateRoute exact path="/tv" component={TvForm}/>
                            <PrivateRoute exact path="/tv/:id" component={TvForm}/>
                        </TvProvider>
                        <Route exact path="/" render={() => <Redirect to="/tvs"/>}/>
                    </AuthProvider>
                </NetworkWrapper>
            </IonRouterOutlet>
        </IonReactRouter>
    </IonApp>
);

export default App;
