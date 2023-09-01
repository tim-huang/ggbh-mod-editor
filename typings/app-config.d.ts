
namespace AppConfig {
    export type IFieldConfig = {
        code: string;
        // original label, only for merged config
        label?: string
        // customized label
        alias?: string;
        // hint for the field
        desc?: string;
        // map to a built-in dictionary
        dictionary?: string;
        // refer to another object
        refer?: {
            object: string;
            field: string;
        }[],
        multiple?: boolean;
        multiLines?: boolean;
    }
    export interface GameObjectConfig {
        // a map from field code to field display label
        fields?: Record<string, IFieldConfig>;
        // which fields are displayed in brief mode
        brief?: string[];
        // which fields are displayed in inline mode
        inline?: string[];
    };

    export interface Dictionary {
        id: string;
        label: string;
        entries: Record<string, string>;
    };

    export interface BattleEffectAPI {
        id: string;
        desc: string;
        targetID?: IFieldConfig,
        value1?: IFieldConfig,
        value2?: IFieldConfig,
        value3?: IFieldConfig,
        value4?: IFieldConfig,
        value5?: IFieldConfig,
        value6?: IFieldConfig,
        value7?: IFieldConfig,
        value8?: IFieldConfig,
        effect1?: IFieldConfig,
        effect2?: IFieldConfig,
        effect3?: IFieldConfig,
        effect4?: IFieldConfig,
        effect5?: IFieldConfig,
        effect6?: IFieldConfig,
    }
}
