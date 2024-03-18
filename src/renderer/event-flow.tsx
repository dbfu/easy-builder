import { message } from 'antd';
import { execScript } from './exec-script';
import { getPropValue } from './utils';

const actions = [
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
    handler: (config: { type: any, text: any }) => {
      const { type, text } = config;

      if (type === 'success' || type === 'error') {
        message[type as 'success' | 'error'](text);
      }
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
    handler: (config: { timer: number }) => {
      const { timer } = config;
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, timer);
      })
    }
  },
];

const actionMap = actions.reduce<any>((prev, cur) => {
  prev[cur.name] = cur.handler;
  return prev;
}, {})

async function componentMethod(actionConfig: any, ctx: any) {
  const componentRefs = ctx.getComponentRefs();
  if (!componentRefs[actionConfig.componentId]) {
    return Promise.reject();
  }

  // 拿到组件实例，执行对应的方法
  await componentRefs[actionConfig.componentId][actionConfig.method]();
}

export function execEventFlow(
  nodes: Node[] = [],
  ctx: any,
) {
  if (!nodes.length) return;

  nodes.forEach(async (item: any) => {
    // 判断是否是动作节点，如果是动作节点并且条件结果不为false，则执行动作
    if (item.type === 'action' && item.conditionResult !== false) {

      const { config } = item?.config || {};

      const newConfig: any = {};

      Object.keys(config).forEach((key: any) => {
        newConfig[key] = getPropValue(config[key], ctx);
      });

      try {
        if (item.config.type === 'ComponentMethod') {
          await componentMethod(config, ctx);
        } else {
          // 根据不同动作类型执行不同动作
          await actionMap[item.config.type](
            newConfig,
            ctx,
            item,
          );
        }

        // 如果上面没有抛出异常，执行成功事件的后续脚本
        const children = item.children?.filter((o: any) => o.eventKey === 'success');
        execEventFlow(children, ctx);
      } catch {
        // 如果上面抛出异常，执行失败事件的后续脚本
        const children = item.children?.filter((o: any) => o.eventKey === 'error');
        execEventFlow(children, ctx);
      } finally {
        // 如果上面没有抛出异常，执行finally事件的后续脚本
        const children = item.children?.filter((o: any) => o.eventKey === 'finally');
        execEventFlow(children, ctx);
      }
    } else if (item.type === 'condition') {
      // 如果是条件节点，执行条件脚本，把结果注入到子节点conditionResult属性中
      const conditionResult = (item.config || []).reduce(
        (prev: any, cur: any) => {
          const result = execScript(cur.condition, ctx);
          prev[cur.id] = result;
          return prev;
        },
        {}
      );

      (item.children || []).forEach((c: any) => {
        c.conditionResult = !!conditionResult[c.conditionId];
      });
      // 递归执行子节点事件流
      execEventFlow(item.children, ctx);
    } else if (item.type === 'event') {
      // 如果是事件节点，执行事件子节点事件流
      execEventFlow(item.children, ctx);
    }
  });
}