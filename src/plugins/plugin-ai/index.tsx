import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import AIContent from './component';

const AIPlugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'topArea',
        name: 'AIPluginPane',
        type: "Widget",
        index: -11,
        content: (
          <AIContent ctx={ctx} />
        ),
      });

      ctx.logger.log('打个日志');
    },
  };
};

// 插件名，注册环境下唯一
AIPlugin.pluginName = 'AIPlugin';

export default AIPlugin;
