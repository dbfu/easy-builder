import { useState } from "react";

import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Button, Drawer, message } from 'antd';
import DrawerContent from './drawer-content';

function Content({ ctx }: { ctx: IPublicModelPluginContext }) {

  const [visible, setVisible] = useState(false);

  return (
    <div>
      <Button onClick={() => setVisible(true)} type="primary">事件流管理</Button>
      <Drawer
        destroyOnClose
        onClose={() => setVisible(false)}
        width="100vw"
        open={visible}
        title="事件流管理"
        push={false}
        styles={{
          body: {
            padding: 0,
          }
        }}
      >
        <DrawerContent
          onClose={() => setVisible(false)}
          actions={
            [
              {
                name: 'openPage',
                label: '打开页面',
                paramsSetter: [{
                  name: 'url',
                  label: 'url',
                  type: 'input',
                  required: true,
                }, {
                  name: 'isNew',
                  label: '新开窗口',
                  type: 'switch',
                }],
                handler: (config: { url: string, isNew: boolean }) => {
                  const { url, isNew = false } = config;
                  window.open(url, isNew ? '_blank' : '_self');
                }
              },
              {
                name: 'showMessage',
                label: '显示消息',
                paramsSetter: [{
                  name: 'type',
                  label: '消息类型',
                  type: 'select',
                  options: [{
                    label: 'success',
                    value: 'success',
                  }, {
                    label: 'error',
                    value: 'error',
                  }],
                  defaultValue: 'success',
                  required: true,
                }, {
                  name: 'text',
                  label: '消息内容',
                  type: 'input',
                  required: true,
                }],
                handler: (config: { type: 'success' | 'error', text: string }) => {
                  const { type = 'success', text } = config;
                  message[type](text);
                }
              },
              {
                name: 'setTimeout',
                label: '定时器',
                paramsSetter: [{
                  name: 'timer',
                  label: '时间',
                  type: 'input',
                  required: true,
                }],
                handler: (config: { type: 'success' | 'error', text: string }) => {
                  const { type = 'success', text } = config;
                  message[type](text);
                }
              },
            ]
          }
          ctx={ctx}
        />
      </Drawer>
    </div>
  )
}

export default Content;