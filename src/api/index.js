import axios from 'axios';

const url = 'http://localhost:8000/tv';
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

const sendRequest = (method, url, data) => {
    return new Promise((resolve, reject) => {
        axios({
            method,
            url,
            config,
            data,
        })
            .then((response) => {
                const { data } = response;

                if (data && data.success) {
                    resolve(data.data || {});
                } else {
                    reject(data);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
};

export const newWebSocket = (onMessage) => {
    const ws = new WebSocket(`ws://localhost:8000`);

    ws.onopen = () => {
        console.log('[web socket] onopen');
    };
    ws.onclose = () => {
        console.log('[web socket] onclose');
    };
    ws.onerror = error => {
        console.log('[web socket] onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('[web socket] onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
};

export const addTv = async (data) => {
    return await sendRequest('post', url, data);
};

export const getTvs = async () => {
    return await sendRequest('get', url, null)
};

export const getTvById = async (id) => {
    return await sendRequest('get', `${url}/${id}`, null);
};

export const updateTvById = async (data) => {
    return await sendRequest('put', `${url}/${data.id}`, data);
};

export const deleteTvById = async (id) => {
    return await sendRequest('delete', `${url}/${id}`, null);
};
