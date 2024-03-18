import { execEventFlow } from './event-flow';
import { execScript } from './exec-script';

export const parseProps = (props: any, ctx: any) => {

  const { setPageValue } = ctx;

  const newProps: any = {
    // 给每个组件注入设置值的方法，让它们把想要暴露出来的值设置到全局
    setCurPageValue: (fn: Function) => {
      setPageValue((prev: any) => ({
        ...prev,
        [props.__id]: fn(prev[props.__id]),
      }))
    }
  };

  Object.keys(props).forEach(key => {
    // 判断是否是事件
    if (key.startsWith('on') && props[key]) {
      const eventConfig = props[key];
      newProps[key] = () => {
        const { type, value } = eventConfig || {};
        // 如果事件绑定的动作为流程，那么去执行流程
        if (type === 'flow') {
          value.children && execEventFlow(value.children, ctx);
        }
      };
    } else if (typeof props[key] === 'object') {
      // 判断是否是脚本
      if (props[key].type === 'script') {
        // 执行脚本
        newProps[key] = execScript(props[key].script, ctx);
      } else {
        newProps[key] = props[key];
      }
    } else {
      newProps[key] = props[key];
    }
  })

  return newProps;
}

export const getPropValue = (originProp: any, ctx: any) => {
  let propValue;
  if (originProp?.type === 'script') {
    const result = execScript(originProp?.script, ctx);
    propValue = result;
  } else {
    propValue = originProp?.value
  }
  return propValue;
}

