import { Ref, ref } from "vue"

export function usePending<R>(fn: () => Promise<R>, pending?: Ref<boolean>, pendingText?: string) {
  if (!pending) pending = ref<boolean>(false)

  const fnWrapper = async function() {
    if (!pending?.value) {
      pending!.value = true;
      return fn.apply(null).then((r: R) => {
        pending!.value = false;
        return r
      })
    }
    return Promise.reject(pendingText || "Operation is pending, request rejected.")
  }

  return { pending, fn: fnWrapper };
}
