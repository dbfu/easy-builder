import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import Content from './components';
import CustomVariableDialog from './components/variable-dialog';

const EventFlowPlugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {

      // 注册变量绑定面板
      ctx.skeleton.add({
        area: 'centerArea',
        type: 'Widget',
        content: CustomVariableDialog,
        name: 'variableBindDialog',
        props: {
          ctx,
        },
      });

      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'topArea',
        name: 'EventFlowPluginPane',
        type: "Widget",
        index: -10,
        content: (
          <Content ctx={ctx} />
        ),
      });

      debugger

      

      ctx.logger.log('打个日志');
    },
  };
};

// 插件名，注册环境下唯一
EventFlowPlugin.pluginName = 'EventFlowPlugin';

export default EventFlowPlugin;
