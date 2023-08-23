
namespace AppConfig {
    export type IFieldConfig = {
        code: string;
        // original label, only for merged config
        label?: string
        // customized label
        alias?: string;
        // hint for the field
        hint?: string;
        // map to a built-in dictionary
        dictionary?: string;
        // refer to another object
        refer?: {
            object: string;
            field: string;
            multiple?: boolean;
        }[]
    }
    export interface GameObjectConfig {
        // a map from field code to field display label
        fields?: Record<string, IFieldConfig>;
        // which fields are displayed in brief mode
        brief?: string[];
        // which fields are displayed in inline mode
        inline?: string[];
    };
}
