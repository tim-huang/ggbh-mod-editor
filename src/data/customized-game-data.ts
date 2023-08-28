import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { originalGameData } from './original-game-data';

export interface ProjectData {
  path: string,
  readonly: boolean,
  json: Partial<Record<GameDataKey, GameObjectData[]>>,
  dirtyMap: Partial<Record<GameDataKey, boolean>>,
}

const useProjectData = defineStore({
  id: "project-data",
  state: (): ProjectData => ({
    path: "",
    readonly: false,
    json: {},
    dirtyMap: {},
  }),
  getters: {
    /**
     * 合并修改数据与原始数据，用于展示、选择
     */
    combined() {
      const copy: Partial<Record<string, GameObjectData[]>> = {};
      Object.entries(originalGameData).forEach(([k, v]: [string, GameObjectData[]]) => {
        const arr: GameObjectData[] = v.map(obj => ({ ...obj }))
        if (this.json[k as GameDataKey]) {
          const map: Record<string, GameObjectData> = {};
          arr.forEach(item => map[item.id] = item);
          (this.json[k as GameDataKey] as GameObjectData[])?.forEach(data => {
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
    },
    dirty(): boolean {
      return Object.values(this.dirtyMap).includes(true)
    }
  },
  actions: {
    /**
     * 根据用户选择的目录加载MOD数据
     * @param path
     */
    async init(path: string) {
      const data = await window.api.loadProject();
      const json: Partial<Record<GameDataKey, GameObjectData[]>> = {}
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
    updateObject(key: GameDataKey, obj: GameObjectData) {
      const original = originalGameData[key].find(o => o.id === obj.id);
      this.json[key] = this.json[key] || [];
      if (!original) {
        this.json[key]!.push(obj)
      } else {
        // compare object
        const ignoreFields = ['customized']
        const diff: GameObjectData = { id: obj.id }
        Object.entries(obj).filter(([k, v]) => !ignoreFields.includes(k) && original[k] !== v)
          .forEach(([k, v]) => diff[k] = v);

        if (Object.keys(diff).length > 1) { // obj is diferent from original object
          // replace customized data
          this.json[key] = this.json[key] || [];
          const idx = this.json[key]!.findIndex(o => o.id === obj.id);
          diff.id = obj.id;
          if (idx >= 0) {
            (this.json[key]!)[idx] = diff;
          } else {
            this.json[key]!.push(diff);
          }
        } else {
          // remove customized
          this.json[key] = this.json[key]?.filter(o => o.id !== obj.id)
        }
      }
      console.debug(this.json[key])
      this.dirtyMap[key] = true;
    },
    remove(key: GameDataKey, id: string) {
      if (this.json[key] && this.json[key]!.find(o => o.id === id)) {
        this.json[key] = this.json[key]?.filter(o => o.id !== id);
        this.dirtyMap[key] = true;
      }

    },
    async save() {
      const promises = Object.entries(this.dirtyMap).map(([key, dirty]) => {
        if (dirty) {
          window.api.writeJsonFile(key, JSON.stringify(this.json[key as GameDataKey] || [], null, 2))
        }
      });
      await Promise.all(promises)
      this.dirtyMap = {} as Partial<Record<GameDataKey, boolean>>;
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
  const getReferenceObjectsByField = (field: AppConfig.IFieldConfig, fieldValue?: string): Partial<Record<GameDataKey, GameObjectData[]>> | undefined => {
    if (!fieldValue) return;
    const result: Partial<Record<GameDataKey, GameObjectData[]>> = {}
    field.refer?.forEach(refer => {
      const values = field.multiple ? fieldValue.split('|') : [fieldValue]
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
  const getReferenceObjects = (currentObject: GameObjectData, fields: AppConfig.IFieldConfig[]) => {
    const objs: Record<string, Partial<Record<GameDataKey, GameObjectData[]>>> = {}
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

