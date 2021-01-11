import config from './constants';
import { sendRequest } from "./utils";

const url = `http://${config.baseUrl}/tv`;

export const newWebSocket = (token, onMessage) => {
    const ws = new WebSocket(`ws://${config.baseUrl}`);

    ws.onopen = () => {
        console.log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        console.log('web socket onclose');
    };
    ws.onerror = error => {
        console.log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        console.log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
};

export const getTvs = async (token, search, page, limit, filters) => {
    let query = '';
    if (search) {
        query = `?search=${search}`;
    } else if (filters) {
        const { hasStartDate, startDate, hasEndDate, endDate, type } = filters;
        const params = new URLSearchParams({
            startDate: hasStartDate && startDate ? startDate : undefined,
            endDate: hasEndDate && endDate ? endDate : undefined,
            type: type ? type : undefined,
        });

        query = `?${params}`;
    } else if (page && limit) {
        query = `?page=${page}&limit=${limit}`;
    }

    return await sendRequest('get', `${url}${query}`, null, token)
};

export const getTvById = async (id, token) => {
    return await sendRequest('get', `${url}/${id}`, null, token);
};

export const addTv = async (data, token) => {
    return await sendRequest('post', url, data, token);
};

export const updateTvById = async (data, token) => {
    return await sendRequest('put', `${url}/${data._id}`, data, token);
};

export const deleteTvById = async (id, token) => {
    return await sendRequest('delete', `${url}/${id}`, null, token);
};
