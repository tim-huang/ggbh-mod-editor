import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { originalGameData } from './original-game-data';
import { IAppConfig } from './app-config';

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
              Object.assign(map[data.id], data, { customized: 'M' })
            } else {
              arr.push({ ...data, customized: 'A' })
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
    updateObject(key: GameDataKey, obj: GameConfigDataType) {
      const original = originalGameData[key].find(o => o.id === obj.id);
      this.json[key] = this.json[key] || [];
      if (!original) {
        this.json[key]!.push(obj)
      } else {
        // compare object
        const diff: GameConfigDataType = { id: obj.id }
        Object.entries(obj).filter(([k, v]) => original[k] !== v)
          .forEach(([k, v]) => diff[k] = v);
        this.json[key].push(diff);
      }
    }
  }
})


export const useGameData = () => {
  const gameData = useProjectData()
  const getText = (key: string, lang: 'ch' | 'tc' | 'en' = 'ch'): string[] => {
    if (!key || key === '0') return []
    return gameData.texts[key]?.map(text => text[lang]) || []
  }
  // 查找一个field对应的对象
  const getReferenceObjectsByField = (field: AppConfig.IFieldConfig, fieldValue?: string): Partial<Record<GameDataKey, GameConfigDataType[]>> | undefined => {
    if (!fieldValue) return;
    const result: Partial<Record<GameDataKey, GameConfigDataType[]>> = {}
    field.refer?.forEach(refer => {
      const values = refer.multiple ? fieldValue.split('|') : [fieldValue]
      const found = gameData.combined[refer.object as GameDataKey]
        .filter(data => values.includes(data[refer.field]))
      if (found?.length) {
        result[refer.object as GameDataKey] = found;
      }
    })
    if (Object.keys(result).length) {
      return result
    }
    return undefined
  }
  // 查找一个对象各个列引用的其它对象
  const getReferenceObjects = (currentObject: GameConfigDataType, fields: AppConfig.IFieldConfig[]) => {
    const objs: Record<string, Partial<Record<GameDataKey, GameConfigDataType[]>>> = {}
    fields.filter(field => field.refer?.length)
      .forEach(referField => {
        const result = getReferenceObjectsByField(referField, currentObject[referField.code])
        if (result) {
          objs[referField.code] = result;
        }
      })
    return objs;
  }
  return {
    gameData,
    getReferenceObjectsByField,
    getReferenceObjects,
    fn: {
      getText
    }
  }
}

