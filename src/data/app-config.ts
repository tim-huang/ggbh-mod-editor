import { defineStore } from 'pinia';
import { GameDataKey, gameMetaInfo } from '@/common/ggbh-meta';
import JSON5 from 'json5'
import { computed } from "vue";

export interface IAppConfig {
    objects?: Partial<Record<GameDataKey, AppConfig.GameObjectConfig>>,
}

export const useAppConfig = defineStore({
    id: "app-config",
    state: (): { config: IAppConfig } => ({
        config: {}
    }),
    actions: {
        async init() {
            const config = await window.api.readConfig();
            this.config = JSON5.parse(config)
        },
        async save() {
            return window.api.saveConfig(JSON.stringify(this.config, null, 2))
        },
        getObject(key: GameDataKey): AppConfig.GameObjectConfig {
            if (!this.config.objects) this.config.objects = {};
            if (!this.config.objects[key]) this.config.objects[key] = {};
            return this.config.objects[key] as AppConfig.GameObjectConfig;
        },
        removeInlineField(key: GameDataKey, code: string) {
            if (!this.config.objects) {
                this.config.objects = {};
            }
            const obj = this.config.objects[key] = this.config.objects[key] || {};
            obj.inline = obj.inline?.filter(v => v != code)
        },
        addInlineField(key: GameDataKey, code: string) {
            if (!this.config.objects) {
                this.config.objects = {};
            }
            const obj = this.config.objects[key] = this.config.objects[key] || {};
            if (obj.inline) {
                obj.inline.push(code)
            } else {
                obj.inline = [code]
            }
        },
        addBriefField(key: GameDataKey, code: string) {
            if (!this.config.objects) {
                this.config.objects = {};
            }
            const obj = this.config.objects[key] = this.config.objects[key] || {};
            if (obj.brief) {
                obj.brief.push(code)
            } else {
                obj.brief = [code]
            }
        },
        removeBriefField(key: GameDataKey, code: string) {
            if (!this.config.objects) {
                this.config.objects = {};
            }
            const obj = this.config.objects[key] = this.config.objects[key] || {};
            obj.brief = obj.brief?.filter(v => v != code)
        },

    }
});

export const useGameObject = (key: () => GameDataKey) => {
    const appConfig = useAppConfig();

    const objectConfig = computed<AppConfig.GameObjectConfig>(() => {
        if (!appConfig.config.objects) return {};
        return appConfig.config.objects[key()] || {}
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
        const config = appConfig.config.objects && appConfig.config.objects[key()];
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
        console.log(mergedObjectConfig.value.brief)
        return objectConfig.value.brief?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const mergedInlineFields = computed<AppConfig.IFieldConfig[]>(() => {
        return mergedObjectConfig.value.inline?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const mergedBriefFields = computed<AppConfig.IFieldConfig[]>(() => {
        console.log(mergedObjectConfig.value.brief)
        return mergedObjectConfig.value.brief?.map(code => mergedObjectConfig.value.fields![code]) || [];
    })

    const getOrCreateField = (code: string) => {
        const obj = appConfig.getObject(key());
        if (!obj.fields) {
            obj.fields = {}
        }
        return (obj.fields[code] = obj.fields[code] || { code });
    }

    return {
        appConfig,
        objectConfig,
        briefFields,
        inlineFields,
        mergedObjectConfig,
        mergedInlineFields,
        mergedBriefFields,
        getOrCreateField
    }
}
