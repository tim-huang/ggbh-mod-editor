import { defineStore } from 'pinia';
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { computed } from "vue";

export interface IAppConfig {
    objects?: Partial<Record<GameDataKey, AppConfig.GameObjectConfig>>,
    dictionary?: Record<string, AppConfig.Dictionary>
}

const swap = (arr: any[] | undefined, index1: number, index2: number) => {
    if (!arr?.length) return;
    if (index1 < 0 || index1 > arr.length - 1) return;
    if (index2 < 0 || index2 > arr.length - 1) return;
    [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
}

export const useAppConfig = defineStore({
    id: "app-config",
    state: (): IAppConfig => ({
        objects: {},
        dictionary: {},
    }),
    actions: {
        async init() {
            const config = await window.api.readConfig();
            const json = JSON5.parse(config) as IAppConfig;
            this.objects = json.objects;
            this.dictionary = json.dictionary;
        },
        async save() {
            return window.api.saveConfig(JSON.stringify(this.$state, null, 2))
        },
        getObject(key: GameDataKey): AppConfig.GameObjectConfig {
            if (!this.objects) this.objects = {};
            if (!this.objects[key]) this.objects[key] = {};
            return this.objects[key] as AppConfig.GameObjectConfig;
        },
        removeInlineField(key: GameDataKey, code: string) {
            const obj = this.getObject(key);
            obj.inline = obj.inline?.filter(v => v != code)
        },
        addInlineField(key: GameDataKey, code: string) {
            const obj = this.getObject(key)
            obj.inline = obj.inline || []
            obj.inline.push(code)
        },
        moveInlineField(key: GameDataKey, index: number, offset: -1 | 1) {
            const obj = this.getObject(key)
            swap(obj.inline, index, index + offset)
        },
        addBriefField(key: GameDataKey, code: string) {
            const obj = this.getObject(key)
            obj.brief = obj.brief || []
            obj.brief.push(code)
        },
        removeBriefField(key: GameDataKey, code: string) {
            const obj = this.getObject(key)
            obj.brief = obj.brief?.filter(v => v != code)
        },
        moveBriefField(key: GameDataKey, index: number, offset: -1 | 1) {
            const obj = this.getObject(key)
            swap(obj.brief, index, index + offset)
        },
        getSelectOptions(dictionaryId: string) {
            const dict = (this.dictionary || {})[dictionaryId];
            if (!dict) return []
            return Object.entries(dict.entries).map(([k, v]) => {
                return {
                    value: k,
                    label: v,
                }
            })
        },
        getDictionary(dictionaryId: string) {
            const dict = (this.dictionary || {})[dictionaryId]?.entries || {};
            return dict;
        }
    }
});

export const useGameObject = (key: () => GameDataKey) => {
    const appConfig = useAppConfig();

    const objectConfig = computed<AppConfig.GameObjectConfig>(() => {
        if (!appConfig.objects) return {};
        return appConfig.objects[key()] || {}
    })

    const mergedObjectConfig = computed<AppConfig.GameObjectConfig>(() => {
        const result: AppConfig.GameObjectConfig = {}
        const metaInfo = gameMetaInfo[key()];
        const fieldCodes: string[] = [];
        metaInfo?.fields?.forEach((field: GameConfigFieldMeta) => {
            result.fields = result.fields || {}
            result.fields[field.code] = { ...field }
            fieldCodes.push(field.code);
        })
        const config = appConfig.objects && appConfig.objects[key()];
        result.brief = config?.brief?.length ? config.brief : fieldCodes;
        result.inline = config?.inline?.length ? config.inline : fieldCodes;
        Object.values(config?.fields || {}).forEach(field => {
            result.fields![field.code] = Object.assign({}, result.fields![field.code], field)
        })
        return result;
    })

    const inlineFields = computed<AppConfig.IFieldConfig[]>(() => {
        return objectConfig.value.inline?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const briefFields = computed<AppConfig.IFieldConfig[]>(() => {
        return objectConfig.value.brief?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const mergedInlineFields = computed<AppConfig.IFieldConfig[]>(() => {
        return mergedObjectConfig.value.inline?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const mergedBriefFields = computed<AppConfig.IFieldConfig[]>(() => {
        return mergedObjectConfig.value.brief?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const getOrCreateField = (code: string) => {
        const obj = appConfig.getObject(key());
        if (!obj.fields) {
            obj.fields = {}
        }
        return (obj.fields[code] = obj.fields[code] || { code });
    }
    const setField = (field: AppConfig.IFieldConfig) => {
        const obj = appConfig.getObject(key());
        if (!obj.fields) {
            obj.fields = {}
        }
        obj.fields[field.code] = field;
    }
    return {
        appConfig,
        objectConfig,
        briefFields,
        inlineFields,
        mergedObjectConfig,
        mergedInlineFields,
        mergedBriefFields,
        getOrCreateField,
        setField
    }
}
