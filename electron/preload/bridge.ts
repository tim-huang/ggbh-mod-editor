import { contextBridge, ipcRenderer } from "electron";
import { ApiName } from "../common/api-name";

(function() {
  let projectPath = "";

  // popup open file dialog
  const selectPath = async () => {
    const selected = await ipcRenderer.invoke(ApiName.selectPath)
    if (selected) {
      projectPath = selected
    }
    return selected
  }

  // read json file
  const readJsonFile = (fileName: string) => {
    return ipcRenderer.invoke(ApiName.readJson, projectPath, fileName)
  }

  // write json file
  const writeJsonFile = (fileName: string, jsonData: any) => {
    return ipcRenderer.invoke(ApiName.writeJson, projectPath, fileName + ".json", jsonData)
  }

  // load project
  const loadProject = () => {
    if (!projectPath) {
      return
    }
    return ipcRenderer.invoke(ApiName.loadProject, projectPath)
  }

  // read app config
  const readConfig = () => {
    return ipcRenderer.invoke(ApiName.readAppConfig)
  }

  // save app config
  const saveConfig = (data: string) => {
    return ipcRenderer.invoke(ApiName.saveAppConfig, data)
  }

  // open project path in sys app
  const openProjectInSysApp = () => {
    return ipcRenderer.invoke(ApiName.openProjectInSysApp, projectPath)
  }

  const api = {
    selectPath,
    readJsonFile,
    writeJsonFile,
    loadProject,
    readConfig,
    saveConfig,
    openProjectInSysApp
  }
  window['api'] = api
})()

// contextBridge.exposeInMainWorld('api', {
// })
