
export interface IElectronAPI {
  selectPath: () => Promise<string | undefined>,
  readJsonFile: (fileName: string) => Promise<string | undefined>,
  writeJsonFile: (fileName: string, data: string | object) => Promise<any>,
  loadProject: () => Promise<Record<string, string>>,
  readConfig: () => Promise<string>,
  saveConfig: (data: string) => Promise<any>,
  openProjectInSysApp: () => Promise<any>,
  readLastUpdate: () => Promise<string>,
  writeLastUpdate: (data: string) => Promise<any>,
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
