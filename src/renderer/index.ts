import ConfigProvider from '@alifd/next/lib/config-provider';
import {
  adapter,
  addonRendererFactory,
  baseRendererFactory,
  blockRendererFactory,
  componentRendererFactory,
  pageRendererFactory,
  rendererFactory,
  tempRendererFactory,
  types,
} from '@alilc/lowcode-renderer-core';
import { isVariable } from '@alilc/lowcode-utils';
import React, {
  Component,
  ContextType,
  PureComponent,
  ReactInstance,
  createContext,
  createElement,
  forwardRef,
} from 'react';
import ReactDOM from 'react-dom';

window.React = React;
(window as any).ReactDom = ReactDOM;

adapter.setRuntime({
  Component,
  PureComponent,
  createContext,
  createElement,
  forwardRef,
  findDOMNode: ReactDOM.findDOMNode,
});

const BaseRenderer = baseRendererFactory();

class CustomBaseRenderer extends BaseRenderer {
  constructor(props: any, context: any) {
    super(props, context);

    const parseProps = this.__parseProps;
    // 这里判断一下如果是变量类型，把type改成script，不然执行base的__parseProps方法还是会问题，这个脚本后面在另外一个地方处理 
    this.__parseProps = (props: any, self: any, path: string, info: any) => {
      if (isVariable(props) as any) {
        return {
          type: 'script',
          value: props.value,
          script: props.script,
        } as any;
      }
      return parseProps(props, self, path, info);
    };
  }
}

adapter.setRenderers({
  BaseRenderer: CustomBaseRenderer,
} as any);

adapter.setConfigProvider(ConfigProvider);

const PageRenderer = pageRendererFactory();

class CustomPageRenderer extends PageRenderer {
  constructor(props: any, context: any) {
    super(props, context);
  }
}

function factory(): types.IRenderComponent {
  adapter.setRenderers({
    BaseRenderer: CustomBaseRenderer,
    PageRenderer: CustomPageRenderer,
    ComponentRenderer: componentRendererFactory(),
    BlockRenderer: blockRendererFactory(),
    AddonRenderer: addonRendererFactory(),
    TempRenderer: tempRendererFactory(),
    DivRenderer: blockRendererFactory(),
  });

  const Renderer = rendererFactory();

  return class ReactRenderer extends Renderer implements Component {
    readonly props!: types.IRendererProps;

    context: ContextType<any>;

    setState!: (state: types.IRendererState, callback?: () => void) => void;

    forceUpdate!: (callback?: () => void) => void;

    refs!: {
      [key: string]: ReactInstance;
    };

    constructor(props: types.IRendererProps, context: ContextType<any>) {
      super(props, context);
    }

    isValidComponent(obj: any) {
      return obj?.prototype?.isReactComponent || obj?.prototype instanceof Component;
    }
  };
}

export default factory();
