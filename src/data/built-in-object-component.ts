import { GameDataKey } from "@/common/ggbh-meta";
import { Component } from "vue";

interface ObjectBuiltInComponent {
  briefViewer?: Component,
  inlineViewer?: Component,
}

const builtInObjectComponent: Partial<Record<GameDataKey, ObjectBuiltInComponent>> = {

}

const builtInFieldComponent: Partial<Record<GameDataKey, Record<string, Component>>> = {

}
