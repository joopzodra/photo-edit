import { contextBridge } from 'electron';
import * as path from 'path';
import { ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(
  'api',
  {
    send: (channel: string, data: any) => {
      const validChannels = [
        'button-action'
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel: string, func: any) => {
      const validChannels = [
        'file-opened',
        'clear-editor',
        'edited-thumbs'
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
