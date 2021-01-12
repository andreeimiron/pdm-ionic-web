import { useEffect, useState } from 'react';
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

export const useMyLocation = (isOnline) => {
    const [state, setState] = useState({});
    useEffect(watchMyLocation, [isOnline]);

    if (!isOnline) {
        return null;
    }

    return state;

    function watchMyLocation() {
        if (!isOnline) {
            return;
        }

        let cancelled = false;
        Geolocation.getCurrentPosition()
            .then(position => updateMyPosition('current', position))
            .catch(error => updateMyPosition('current',undefined, error));
        const callbackId = Geolocation.watchPosition({}, (position, error) => {
            updateMyPosition('watch', position, error);
        });

        return () => {
            cancelled = true;
            console.log(`[LOCATION] Clear watch with id ${callbackId}`);
            Geolocation.clearWatch({ id: callbackId });
        };

        function updateMyPosition(source, position, error) {
            console.log('[LOCATION]', source, position, error);
            if (!cancelled) {
                setState({ ...state, position: position || state.position, error });
            }
        }
    }
};
