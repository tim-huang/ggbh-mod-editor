import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { originalGameData } from './original-game-data';

export interface ProjectData {
  path: string,
  readonly: boolean,
  json: Partial<GameConfigDataMap>,
  dirty: Partial<Record<GameDataKey, boolean>>,
}

const useProjectData = defineStore({
  id: "project-data",
  state: (): ProjectData => ({
    path: "",
    readonly: false,
    json: {},
    dirty: {},
  }),
  getters: {
    /**
     * 合并修改数据与原始数据，用于展示、选择
     */
    combined() {
      const copy: Partial<Record<string, GameConfigDataType[]>> = {};
      Object.entries(originalGameData).forEach(([k, v]: [string, GameConfigDataType[]]) => {
        const arr: GameConfigDataType[] = v.map(obj => ({ ...obj }))
        if (this.json[k as GameDataKey]) {
          const map: Record<string, GameConfigDataType> = {};
          arr.forEach(item => map[item.id] = item);
          (this.json[k as GameDataKey] as GameConfigDataType[])?.forEach(data => {
            if (map[data.id]) {
              Object.assign(map[data.id], data)
            } else {
              arr.push({ ...data })
            }
          })
        }
        copy[k as GameDataKey] = arr
      });
      return copy as unknown as GameConfigDataMap;
    },
    /**
     * 生成文本映射表(LocalText & RoleLogLocal)，方便查询多语言文本
     */
    texts(): Record<string, ITextConfig[]> {
      const map: Record<string, ITextConfig[]> = {}
      this.combined.LocalText?.forEach(lt => {
        map[lt.key] = map[lt.key] || []
        map[lt.key].push(lt)
      })
      this.combined.RoleLogLocal?.forEach(rll => {
        map[rll.keyID] = map[rll.keyID] || []
        map[rll.keyID].push(rll)
      })
      return map;
    }
  },
  actions: {
    /**
     * 根据用户选择的目录加载MOD数据
     * @param path
     */
    async init(path: string) {
      const data = await window.api.loadProject();
      const json: Partial<Record<GameDataKey, GameConfigDataType[]>> = {}
      for (let key of Object.keys(data)) {
        if (!data[key] || !data[key].trim()) {
          continue
        }
        try {
          json[key as GameDataKey] = JSON5.parse(data[key])
        } catch (err) {
          console.error('Error at parsing', key, ":", err)
          console.error('Content:', data[key])
        }
      }
      this.json = json as GameConfigDataMap;
      this.path = path;
    },
    /**
     * 重新加载指定的JSON文件
     * @param key
     */
    async load(key: GameDataKey) {
      const data = await window.api.readJsonFile(key + ".json")
      if (data) {
        this.json[key] = JSON5.parse(data)
      }

      return this.json[key]
    },
  }
})


export const useGameData = () => {
  const gameData = useProjectData()
  const getText = (key: string, lang: 'ch' | 'tc' | 'en' = 'ch'): string[] => {
    if (!key || key === '0') return []
    return gameData.texts[key]?.map(text => text[lang]) || []
  }

  return {
    gameData,
    fn: {
      getText
    }
  }
}

