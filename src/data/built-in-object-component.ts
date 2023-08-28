import { GameDataKey } from "@/common/ggbh-meta";
import { Component } from "vue";

import DramaDialogueViewer from '@/components/drama/drama-dialogue-viewer.vue';


interface ObjectBuiltInComponent {
  briefViewer?: Component,
  inlineViewer?: Component,
  objectViewer?: Component,
  objectEditor?: Component
}

const builtInObjectComponent: Partial<Record<GameDataKey, ObjectBuiltInComponent>> = {
  DramaDialogue: {
    objectViewer: DramaDialogueViewer,
  }
}

const builtInFieldComponent: Partial<Record<GameDataKey, Record<string, Component>>> = {

}

// const defaultObjectComponent: ObjectBuiltInComponent = {
//   briefViewer: () => import('/@/components/brief-viewer.vue'),
//   inlineViewer: () => import('/@/components/inline-viewer.vue'),
//   objectViewer: () => import('/@/components/game-data-viewer.vue'),
//   objectEditor: () => import('/@/components/object-editor.vue'),
// };


export const getObjectComponent = (objectType: GameDataKey, componentId: keyof (ObjectBuiltInComponent)) => {
  const obj = builtInObjectComponent[objectType];
  if (obj) {
    return obj[componentId];
  }
  // const fn = defaultObjectComponent[componentId];
  // if (!fn) {
  //   throw new Error('Component ID' + componentId + 'not found in getObjectBriefViewer')
  // }
  // return fn();
}

export const getObjectInlineViewer = (objectType: GameDataKey) => getObjectComponent(objectType, 'inlineViewer');
export const getObjectBriefViewer = (objectType: GameDataKey) => getObjectComponent(objectType, 'briefViewer');
export const getObjectViewer = (objectType: GameDataKey) => getObjectComponent(objectType, 'objectViewer');
export const getObjectEditor = (objectType: GameDataKey) => getObjectComponent(objectType, 'objectEditor');
