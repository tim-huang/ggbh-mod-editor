import { GameDataKey } from "@/common/ggbh-meta";
import { useGameObject } from "./app-config";


type ObjectFieldsModifier = (data: GameObjectData) => AppConfig.IFieldConfig[];

const objectFieldsModifierMap: Partial<Record<GameDataKey, ObjectFieldsModifier>> = {
  [GameDataKey.BattleEffect]: (data) => {
    const { appConfig, mergedObjectConfig } = useGameObject(() => GameDataKey.BattleEffect);
    const effectApi = (appConfig.battleEffect || {})[(data as BattleEffect).typeID];
    if (!effectApi) return Object.values(mergedObjectConfig.value.fields || {});

    const fields: AppConfig.IFieldConfig[] = []
    Object.values(mergedObjectConfig.value.fields || {}).filter(field => field).forEach(field => {
      if (['id', 'typeID', 'desc', 'targetID'].includes(field.code)) {
        fields.push(field)
      } else {
        const param = effectApi[field.code as (keyof Omit<AppConfig.BattleEffectAPI, 'id' | 'desc'>)];
        fields.push(param || field)
      }
    })
    return fields;
  }
};

export const getObjectFieldsModifier = (objectType: GameDataKey) => {
  return objectFieldsModifierMap[objectType]
}

