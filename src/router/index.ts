import { h } from 'vue'
import { MessageOutlined, SettingOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'
import * as VueRouter from 'vue-router'
import { ItemType } from 'ant-design-vue'

export interface EditorMenuItem {
  path: string,
  icon?: any,
  label: string,
  hidden?: boolean,
  component: () => Promise<any>,
}
const editorMenuItems: EditorMenuItem[] = [
  {
    path: '/',
    label: 'Home',
    hidden: true,
    component: () => import('@/pages/empty.vue'),
  },
  {
    path: '/drama',
    label: 'Drama',
    icon: h(MessageOutlined),
    component: () => import('@/pages/drama.vue')
  },
  {
    path: '/item',
    label: 'Item',
    component: () => import('@/pages/item.vue')
  },
  {
    path: '/app-config',
    label: 'App Config',
    icon: h(SettingOutlined),
    component: () => import('@/pages/app-config.vue')
  },
  {
    path: '/object-list',
    label: 'Object List',
    icon: h(UnorderedListOutlined),
    component: () => import('@/pages/object-list.vue')
  },
]

export const routers = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: editorMenuItems
})


export const menuItems: ItemType[] = editorMenuItems.filter(item => !item.hidden)
  .map((item) => ({
    key: item.path,
    label: item.label,
    icon: item.icon
  }))
