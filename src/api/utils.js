import axios from "axios";
import get from 'lodash/get';

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: token && `Bearer ${token}`,
});


export const sendRequest = (method, url, data, token) => {
    const headers = getHeaders(token);

    return new Promise((resolve, reject) => {
        axios({
            method,
            url,
            data,
            headers,
        })
            .then((response) => {
                const { data } = response;

                resolve(data);
            })
            .catch((error) => {
                const responseError = get(error, 'response.data', error);
                reject(responseError);
            });
    });
};
