
import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'

export type LastUpdateActionType = 'A' | 'M' | 'D' | 'V';

export interface LastUpdate {
  type: GameDataKey,
  id: string,
  lastUpdate: number,
  action: LastUpdateActionType,
}

const maxNumOfHistroy = 40;

export const useLastUpdate = defineStore({
  id: "last-update",
  state: (): {
    history: LastUpdate[],
    MRU: LastUpdate[],
    disabled: boolean,
  } => ({ history: [], MRU: [], disabled: false }),
  actions: {
    async init() {
      const str = await window.api.readLastUpdate();
      const arr = JSON5.parse(str) as LastUpdate[];
      this.history = arr.sort((a, b) => b.lastUpdate - a.lastUpdate)
      this.MRU = [];
      this.disabled = false;
    },
    async save() {
      // MRU is not persistent
      return window.api.writeLastUpdate(JSON.stringify(this.history, null, 2))
    },
    log(type: GameDataKey, id: string, action: LastUpdateActionType = 'M') {
      if (this.disabled) return; // disabled history logging
      let arr: LastUpdate[] = (action !== 'V' ? this.history : this.MRU).filter(lu => lu.type !== type || lu.id !== id);
      arr.unshift({
        type,
        id,
        action,
        lastUpdate: new Date().getTime()
      })
      if (arr.length > maxNumOfHistroy) {
        arr = arr.slice(0, maxNumOfHistroy);
      }
      if (action !== 'V') {
        // 去掉重复的后再增加新的
        this.history = arr;
      } else {
        this.MRU = arr;
      }
    },
  }
})
