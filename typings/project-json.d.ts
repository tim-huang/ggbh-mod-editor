/**
 * 用于描述JSON对象属性的数据结构
 */
interface GameConfigFieldMeta {
  label: string,
  code: string,
  type: string,
}

/**
 * JSON对象描述结构，一个此接口对象对应一个JSON文件的对象属性
 */
interface GameConfigMeta {
  fields: GameConfigFieldMeta[]
}

/**
 * 所有JSON配置文件中的JSON对象都有一个id
 */
type GameConfigDataType = {
  id: string,
  /**
   * indicate status of data
   * - 'M' : modified
   * - 'A' : added
   */
  customized?: 'M' | 'A'
} & Record<string, string>

/**
 * 文本定义，LocalText & RoleLogLocal
 */
interface ITextConfig {
  id: string;
  ch: string;
  tc: string;
  en: string;
}