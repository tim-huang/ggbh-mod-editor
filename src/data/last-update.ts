
import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'

export type LastUpdateActionType = 'A' | 'M' | 'D';

export interface LastUpdate {
  type: GameDataKey,
  id: string,
  lastUpdate: number,
  action: LastUpdateActionType,
}

export const useLastUpdate = defineStore({
  id: "last-update",
  state: (): { history: LastUpdate[] } => ({ history: [] }),
  actions: {
    async init() {
      const str = await window.api.readLastUpdate();
      const arr = JSON5.parse(str) as LastUpdate[];
      this.history = arr.sort((a, b) => b.lastUpdate - a.lastUpdate)
    },
    async save() {
      return window.api.writeLastUpdate(JSON.stringify(this.history, null, 2))
    },
    log(type: GameDataKey, id: string, action: LastUpdateActionType = 'M') {
      this.history.unshift({
        type,
        id,
        action,
        lastUpdate: new Date().getTime()
      })
    },
  }
})
