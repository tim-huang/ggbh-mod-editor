
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
  state: (): LastUpdate[] => [],
  actions: {
    async init() {
      const str = await window.api.readLastUpdate();
      this.$state = JSON5.parse(str)
    },
    async save() {
      return window.api.writeLastUpdate(JSON.stringify(this.$state, null, 2))
    },
    log(type: GameDataKey, id: string, action: LastUpdateActionType = 'M') {
      this.unshift({
        type,
        id,
        action,
        lastUpdate: new Date().getTime()
      })
    },
  }
})
