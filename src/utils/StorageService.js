import { Plugins } from "@capacitor/core";
import { nanoid } from 'nanoid';
const { Storage } = Plugins;

export const storageKeys = {
    ADDED_TVS: 'added-tvs',
    DELETED_TVS: 'deleted-tvs',
};

class StorageService {
    async setItem(key, data) {
        await Storage.set({
            key,
            value: JSON.stringify(data)
        });
    }

    async getItem(key) {
        const { value } = await Storage.get({ key });
        return JSON.parse(value);
    }

    async removeItem(key) {
        await Storage.remove({ key });
    }

    async getKeys() {
        const { keys } = await Storage.keys();
        return keys;
    }

    async clear() {
        await Storage.clear();
    }

    async addTv(tv) {
        const tvs = await this.getItem(storageKeys.ADDED_TVS) || [];

        if (!tv._id) {
            tv._id = nanoid();
            tv.localOnly = true;
        }

        tvs.push(tv);
        await this.setItem(storageKeys.ADDED_TVS, tvs);
        return tv;
    }

    async saveTv(tv) {
        const tvs = await this.getItem(storageKeys.ADDED_TVS);
        console.log('[StorageService] Added tvs: ', tvs, '  New tv:', tv);
        return await this.addTv(tv);
    }

    async deleteTv(id) {
        const tvs = await this.getItem(storageKeys.ADDED_TVS);
        const index = tvs.findIndex(c => c._id === id);
        console.log('[StorageService] Delete tv id:', id);

        if (index < 0) {
            const deletedTvs = await this.getItem(storageKeys.DELETED_TVS) || [];
            deletedTvs.push({ _id: id });
            await this.setItem(storageKeys.DELETED_TVS, deletedTvs);
        } else {
            tvs.splice(index, 1);
            await this.setItem(storageKeys.ADDED_TVS, tvs);
        }
    }

    async sync(saveFunc, deleteFunc) {
        const tvsToSync = await this.getItem(storageKeys.ADDED_TVS) || [];
        console.log('[SYNC] Tvs to add:', tvsToSync);
        await Promise.all(tvsToSync.map(tv => {
            if (tv.localOnly) {
                delete tv._id;
                delete tv.localOnly;
            }

            saveFunc(tv, true, true);
        }));
        await this.removeItem(storageKeys.ADDED_TVS);

        const tvsToDelete = await this.getItem(storageKeys.DELETED_TVS) || [];
        console.log('[SYNC] Tvs to delete', tvsToDelete);
        await Promise.all(tvsToDelete.map(tv => {
            deleteFunc(tv._id, true, true);
        }));
        await this.removeItem(storageKeys.DELETED_TVS);
    }
}

const storageService = new StorageService();

export default storageService;
