const dramaUiType: Record<string, string> = {
    "1": "普通对话",
    "2": "奇遇小界面",
    "3": "剧情大图",
    "4": "器灵大对话框",
    "5": "器灵小对话框",
    "6": "信件界面",
    "7": "神秘组织普通对话",
    "8": "信件界面（绢材质）",
    "9": "冥妖对话",
    "10": "仙人对话",
    "11": "壶妖对话",
    "12": "剧情大图对话（立绘）",
    "13": "天元山支线奇遇界面",
    "14": "天元山普通对话界面",
    "15": "玩家子女被杀传音给杀人者阻止此行为",
} as Record<string, string>;

const dramaNpc: Record<string, string> = {
    "1": "Player",
    "11": "NPC-B",
    "12": "NPC-C",
}


const dictMetaInfo: Record<string, string> = {
    "dramaUiType": "剧情类型",
    "dramaNpc": "剧情NPC"
}

export type DictionaryId = keyof (typeof dictMetaInfo)

const dictMap: Record<DictionaryId, Record<string, string>> = {
    dramaUiType, dramaNpc,
    dictionary: dictMetaInfo
}

const object2Options = (obj: Record<string, string>) => Object.entries(obj).map(([k, v]) => ({ value: k, label: v })) || [];


export const getSelectOptions = (dictionaryId: DictionaryId) => object2Options(dictMap[dictionaryId]);
export const getDictionary = (dictionaryId: string) => dictMap[dictionaryId];

