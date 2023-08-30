import { notification } from "ant-design-vue";

export const copy = (content: string) => {
  if (!!window.navigator.clipboard) {
    window.navigator.clipboard.writeText((content)).then(_ => {
      notification.success({
        message: 'Text Copied',
        description: content,
        duration: 2,
      })
    }).catch((e) => {
      notification.error({
        message: 'Copy failed',
        description: 'Something bad happened: ' + e.toString()
      })
    });
  }
}

export const paste = (callback: (s: string) => void) => {
  window.navigator.clipboard?.readText().then(callback)
}
