// import { AppConfig } from "vue";
//
// const dramaUiType: Record<string, string> = {
//     "1": "普通对话",
//     "2": "奇遇小界面",
//     "3": "剧情大图",
//     "4": "器灵大对话框",
//     "5": "器灵小对话框",
//     "6": "信件界面",
//     "7": "神秘组织普通对话",
//     "8": "信件界面（绢材质）",
//     "9": "冥妖对话",
//     "10": "仙人对话",
//     "11": "壶妖对话",
//     "12": "剧情大图对话（立绘）",
//     "13": "天元山支线奇遇界面",
//     "14": "天元山普通对话界面",
//     "15": "玩家子女被杀传音给杀人者阻止此行为",
// } as Record<string, string>;
//
// const dramaNpc: Record<string, string> = {
//     "1": "Player",
//     "11": "NPC-B",
//     "12": "NPC-C",
// }
//
// const dramaSpeaker: Record<string, string> = {
//     "1": "左侧NPC",
//     "2": "右侧NPC",
// }
//
// const dictMetaInfo: Record<string, string> = {
//     "dramaUiType": "剧情类型",
//     "dramaNpc": "剧情NPC",
//     "dramaSpeaker": "发言人",
//     "fortuitousEventType": "奇遇类型",
// }
//
// const fortuitousEventType: Record<string, string> = {
//     "1": "大地图踩地雷",
//     "2": "大地图出图标",
//     "3": "战斗内特殊房间",
//     "4": "调用引导功能触发",
//     "5": "指定位置的范围内触发",
//     "6": "大地图固定点奇遇",
//     "7": "当玩家竞价后，NPC抬价时，设置抬价NPC为剧情NPC2",
//     "8": "NPC找玩家聊天（注意，事件动作必须是callDrama）",
//     "9": "玩家在非战斗状态下连续点击某一类物品多次",
//     "10": "玩家在大地图上没有打开其他任何UI，持续一定时间",
//     "11": "玩家打开某个UI且达到指定时间没有进行任何操作时",
//     "12": "打开10005的建筑",
//     "13": "接取宗门任务时触发事件",
//     "14": "自定义触发",
//     "15": "打开10005的建筑分类",
//     "16": "玩家踩到大地图事件上",
// }
//
// export type DictionaryId = keyof (typeof dictMetaInfo)
//
// const dictMap: Record<DictionaryId, Record<string, string>> = {
//     dramaUiType, dramaNpc, dramaSpeaker, fortuitousEventType,
//     dictionary: dictMetaInfo
// }
//
// type Option = {
//     value: string,
//     label: string,
// }
// const object2Options = (obj: Record<string, string>) => Object.entries(obj).map(([k, v]) => ({ value: k, label: v })) || [];
//
// const options: Record<DictionaryId, Option[]> = Object.entries(dictMap).reduce((m, [k, dict]) => {
//     m[k] = object2Options(dict);
//     return m
// }, {} as Record<DictionaryId, Option[]>)
//
//
// export const getSelectOptions = (dictionaryId: DictionaryId) => options[dictionaryId] || [];
// export const getDictionary = (dictionaryId: string) => dictMap[dictionaryId] || {};
// export const generateDictionaryConfig = () => {
//     const dicts: Record<string, AppConfig.Dictionary> = {};
//     Object.entries(dictMetaInfo).forEach(([k, v]) => {
//         const dict = {
//             id: k,
//             label: v,
//             entries: dictMap[k]
//         }
//         dicts[k] = dict
//     })
//     return dicts
// }
//
