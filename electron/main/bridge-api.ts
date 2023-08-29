import { BrowserWindow, dialog, ipcMain, app, shell } from "electron";
import { ApiName } from "../common/api-name";
import { join } from 'node:path'
import fs from 'node:fs'


export const useBridgeApi = (win: BrowserWindow) => {
  const getConfigPath = (projectPath: string, fileName?: string) => {
    return fileName ? join(projectPath, "ModProject", "ModExcel", fileName)
      : join(projectPath, "ModProject", "ModExcel")
  }

  // open file dialog
  async function handleSelectPath() {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    })
    if (!canceled) {
      return filePaths[0]
    }
  }

  ipcMain.handle(ApiName.selectPath, handleSelectPath)

  // read json file
  async function readJson(_: any, projectPath: string, fileName: string): Promise<string | undefined> {
    const filePath = getConfigPath(projectPath, fileName)
    const stat = fs.statSync(filePath)
    console.log(filePath, "==>", stat)
    if (!stat) {
      return "[]";
    }
    if (!stat.isFile()) {
      console.log(filePath, 'is not a file.')
      return undefined
    }

    return fs.promises.readFile(filePath, 'utf8')
  }
  ipcMain.handle(ApiName.readJson, readJson)


  // write json file
  async function writeJson(_: any, projectPath: string, fileName: string, data: string) {
    const filePath = getConfigPath(projectPath, fileName)
    const stat = fs.statSync(filePath)
    if (stat && !stat.isFile()) {
      console.log(filePath, 'is not a file.')
      return '[]'
    }

    return fs.promises.writeFile(filePath, data, "utf8")
  }
  ipcMain.handle(ApiName.writeJson, writeJson)

  // load project json file
  async function loadProject(_: any, projectPath: string): Promise<Record<string, string>> {
    const path = getConfigPath(projectPath)
    // get file list
    const files = (await fs.promises.readdir(path)).filter(file => file.endsWith(".json"))
    // read files
    const readings = files.map(file => fs.promises.readFile(getConfigPath(projectPath, file), "utf8"))
    // wait for results
    const results = await Promise.all(readings)
    // assemble return value
    const obj = {}
    files.forEach((file, idx) => {
      obj[file.replace(".json", "")] = results[idx]
    })
    return obj
  }
  ipcMain.handle(ApiName.loadProject, loadProject)

  // read app config file
  async function readAppConfig(): Promise<string | undefined> {
    const configPath = join(app.getAppPath(), "config.json")
    const stat = fs.statSync(configPath)
    if (!stat?.isFile()) {
      console.log(configPath, 'is not a file.')
      return "{}"
    }

    return fs.promises.readFile(configPath, 'utf8')
  }
  ipcMain.handle(ApiName.readAppConfig, readAppConfig)

  // save app config file
  async function saveAppConfig(_: any, data: string) {
    const configPath = join(app.getAppPath(), "config.json")
    return fs.promises.writeFile(configPath, data, 'utf8')
  }
  ipcMain.handle(ApiName.saveAppConfig, saveAppConfig)

  // open project path in sys app
  async function openInSysApp(_: any, path: string) {
    shell.openPath(path);
  }
  ipcMain.handle(ApiName.openProjectInSysApp, openInSysApp)

  const lastUpdateFileName = "last-update.json";
  // read last update
  async function readLastUpdate(_: any, projectPath: string): Promise<string | undefined> {
    const filePath = join(projectPath, lastUpdateFileName)
    const stat = fs.statSync(filePath)
    if (stat && !stat.isFile()) {
      console.error(filePath, 'is not a file.')
      return undefined
    }

    return fs.promises.readFile(filePath, 'utf8')
  }
  ipcMain.handle(ApiName.readLastUpdate, readLastUpdate)

  // write last update
  async function writeLastUpdate(_: any, projectPath: string, data: string) {
    const filePath = join(projectPath, lastUpdateFileName)
    const stat = fs.statSync(filePath, { throwIfNoEntry: false })
    if (stat && !stat.isFile()) {
      console.log(filePath, 'is not a file.')
      return '[]'
    }

    return fs.promises.writeFile(filePath, data, "utf8")
  }
  ipcMain.handle(ApiName.writeLastUpdate, writeLastUpdate)
}
