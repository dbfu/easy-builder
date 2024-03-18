import { createFetchHandler } from '@alilc/lowcode-datasource-fetch-handler';
import { init, plugins } from '@alilc/lowcode-engine';
import ComponentPanelPlugin from '@alilc/lowcode-plugin-components-pane';
import InjectPlugin from '@alilc/lowcode-plugin-inject';
import ManualPlugin from "@alilc/lowcode-plugin-manual";
import SchemaPlugin from '@alilc/lowcode-plugin-schema';
import SetRefPropPlugin from '@alilc/lowcode-plugin-set-ref-prop';
import './global.scss';
import AIPlugin from './plugins/plugin-ai';
import EditorInitPlugin from './plugins/plugin-editor-init';
import EventFlowPlugin from './plugins/plugin-event-flow';
import LogoSamplePlugin from './plugins/plugin-logo-sample';
import PreviewSamplePlugin from './plugins/plugin-preview-sample';
import SaveSamplePlugin from './plugins/plugin-save-sample';

async function registerPlugins() {
  await plugins.register(InjectPlugin);

  await plugins.register(EditorInitPlugin, {
    scenarioName: 'easy-builder',
    displayName: '易造',
    info: {
      urls: [
        {
          key: '设计器',
          value: 'https://github.com/alibaba/lowcode-demo/tree/main/demo-basic-antd',
        },
        {
          "key": "物料",
          "value": "https://github.com/alibaba/lowcode-materials/tree/main/packages/antd-lowcode-materials"
        }
      ],
    },
  });

  await plugins.register(LogoSamplePlugin);

  await plugins.register(ComponentPanelPlugin);

  await plugins.register(SchemaPlugin);

  await plugins.register(ManualPlugin);


  await plugins.register(SetRefPropPlugin);

  await plugins.register(SaveSamplePlugin);

  await plugins.register(PreviewSamplePlugin);

  await plugins.register(EventFlowPlugin);

  await plugins.register(AIPlugin);

};

(async function main() {
  await registerPlugins();

  init(document.getElementById('lce-container')!, {
    // locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
    requestHandlersMap: {
      fetch: createFetchHandler()
    },
  });
})();
