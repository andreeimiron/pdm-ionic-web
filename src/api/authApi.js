import config from './constants';
import { sendRequest } from "./utils";

const url = `http://${config.baseUrl}/auth`;

export const login = async (username, password) => {
    return await sendRequest('post', `${url}/login`, { username, password });
};
