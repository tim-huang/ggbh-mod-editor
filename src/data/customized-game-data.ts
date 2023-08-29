import { defineStore } from 'pinia';
import { GameDataKey } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { originalGameData } from './original-game-data';
import { useLastUpdate } from './last-update';
import { useAppConfig, useGameObject } from './app-config';

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
      this.dirtyMap = {};
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
      const lastUpdate = useLastUpdate();
      if (!original) {
        this.json[key]!.push(obj);
        lastUpdate.log(key, obj.id, 'A');
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
          lastUpdate.log(key, obj.id, 'M');
        } else {
          // remove customized
          this.json[key] = this.json[key]?.filter(o => o.id !== obj.id)
          lastUpdate.log(key, obj.id, 'D');
        }
      }
      this.dirtyMap[key] = true;
    },
    remove(key: GameDataKey, id: string) {
      if (this.json[key] && this.json[key]!.find(o => o.id === id)) {
        this.json[key] = this.json[key]?.filter(o => o.id !== id);
        useLastUpdate().log(key, id, 'D')
        this.dirtyMap[key] = true;
      }

    },
    async save() {
      // save dirty file
      const promises = Object.entries(this.dirtyMap).map(([key, dirty]) => {
        if (dirty) {
          return window.api.writeJsonFile(key, JSON.stringify(this.json[key as GameDataKey] || [], null, 2))
        }
      });
      // save last update
      promises.push(useLastUpdate().save())
      await Promise.all(promises)
      this.dirtyMap = {} as Partial<Record<GameDataKey, boolean>>;
    },
    getRandomId(key: GameDataKey): string {
      const max = 2147483647;
      const min = -2147483648;

      while (true) {
        const offset = Math.floor(Math.random() * max);
        const id = (offset < max / 2 ? (min + offset) : (max - offset)).toString();
        if (!this.combined[key]?.some(o => o.id === id)) {
          return id;
        }
      }
    },
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
    if (!fieldValue || fieldValue === '0') return;
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

  // search
  const search = ({ keyword, key, customizedOnly }: { keyword: string, key?: GameDataKey, customizedOnly?: boolean }) => {
    if (!keyword) {
      return {};
    }
    const result: Partial<Record<GameDataKey, GameObjectData[]>> = {};
    Object.entries(gameData.combined).filter(([k, _]) => !key || k === key)
      .forEach(([k, arr]) => {
        const { mergedObjectConfig } = useGameObject(() => k as GameDataKey);
        const filtered = (arr as GameObjectData[]).filter(row => !customizedOnly || row.customized)
          .filter((row) => {
            // filter out by keyword
            if (!keyword) return true;
            if (Object.values(row).some(v => v && v.toString().indexOf(keyword) >= 0)) {
              return true;
            }
            // deep search if it's related to LocalText or RoleLogLocal
            return Object.values(mergedObjectConfig.value.fields || {})
              .filter(field => field.refer?.some(r => [GameDataKey.LocalText, GameDataKey.RoleLogLocal].includes(r.object as GameDataKey)))
              .some(field => getText(row[field.code]).some(text => text.indexOf(keyword) > 0))
          })
        if (filtered.length) {
          result[k as GameDataKey] = filtered;
        }
      })
    return result;
  }

  return {
    gameData,
    getReferenceObjectsByField,
    getReferenceObjects,
    getText,
    search,
  }
}

