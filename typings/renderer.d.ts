
export interface IElectronAPI {
  selectPath: () => Promise<string | undefined>,
  readJsonFile: (fileName: string) => Promise<string | undefined>,
  writeJsonFile: (fileName: string, data: string | object) => void,
  loadProject: () => Promise<Record<string, string>>,
  readConfig: () => Promise<string>,
  saveConfig: (data: string) => Promise<void>,
  openProjectInSysApp: () => Promise<void>,
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
