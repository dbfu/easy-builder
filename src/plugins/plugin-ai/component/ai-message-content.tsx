import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Modal, Spin } from 'antd';
import React, { useEffect, useRef, useState } from "react";
import { v4 } from 'uuid';
import ComponentTreeSelect from './component-tree-select';
import { getComponentDesc, getComponentsByName, getEventFlow, saveSchema } from './utils';

export interface AIContent {
  componentName?: string,
  event: string,
  action: {
    onSuccess?: AIContent['action'],
    onError?: AIContent['action'],
  } & {
    name: string,
    [k: string]: any,
  },
}

export interface AIMessage {
  id: string,
  role: 'ai',
  content?: AIContent,
  status: 'loading' | 'success' | 'error'
}


function AIMessageContent({ message, ctx }: {
  message: AIMessage,
  ctx: IPublicModelPluginContext
}) {

  const [lines, setLines] = useState<{ id: string, type: 'string' | 'select', value: any }[]>([]);
  const [selectOpen, setSelectOpen] = useState(false);

  const selectResolve = useRef<any>();
  const selectReject = useRef<any>();

  const showSelect = () => {
    return new Promise((resolve, reject) => {
      selectResolve.current = resolve;
      selectReject.current = reject;
      setSelectOpen(true);
    });
  }

  const createLine = (text: string | React.ReactNode) => {
    setLines(prev => [...prev, { id: v4(), type: 'string', value: text }]);
  }

  const doPreview = () => {
    const scenarioName = ctx.config.get('scenarioName');
    saveSchema(scenarioName, ctx);
    setTimeout(() => {
      const search = location.search ? `${location.search}&scenarioName=${scenarioName}` : `?scenarioName=${scenarioName}`;
      window.open(`./preview.html${search}`);
    }, 500);
  }

  const parseEventFlow = async (eventFlow?: AIContent, lastEventChildren?: any) => {

    if (message.status !== 'success' || !eventFlow) {
      return;
    }

    createLine(lastEventChildren ? '开始分析子流程...' : '开始分析流程...');

    let eventChildren: any;

    const { componentName, event, action } = eventFlow;
    const { componentsTree } = ctx.project.exportSchema(IPublicEnumTransformStage.Save);

    // 解析源组件
    async function parseSourceComponent() {

      if (!componentName && !lastEventChildren) {
        createLine(`组件为空，终止分析`);
        return false;
      }

      if (!lastEventChildren && !ctx.material.getComponentMetasMap().has(componentName || '')) {
        createLine(`组件${componentName}不存在，终止分析`);
        return false;
      }

      if (!componentName) return;

      const sourceComponents: any[] = [];
      getComponentsByName(componentsTree, componentName, sourceComponents);

      if (sourceComponents.length === 0) {
        const componentDesc = getComponentDesc(componentName, ctx);
        createLine(`画布中没有发现${componentDesc}组件，已为你自动生成`);
        const node = ctx.project.currentDocument?.createNode({
          id: v4(),
          componentName,
          props: ctx.material?.getComponentMeta(componentName || '')?.getMetadata()?.snippets?.[0]?.schema?.props,
        });
        ctx.project.currentDocument?.insertNode(ctx.project.currentDocument.root!, node!);
        sourceComponents[0] = node;
      } else if (sourceComponents.length > 1) {
        createLine('画布中发现多个按钮组件，请先选择一个');
        try {
          const selectComponent = await showSelect() as string;
          const component = ctx.project.currentDocument?.getNodeById(selectComponent)!;
          createLine('已选择组件:' + component.componentName);
          sourceComponents[0] = component;
        } catch {
          createLine('取消选择，已为你自动选择');
        }
      }

      return ctx.project.currentDocument?.getNodeById(sourceComponents[0].id);
    }

    const sourceComponent = await parseSourceComponent();

    if (sourceComponent === false) return;

    function parseEvent() {
      createLine(`开始分析事件`);
      if (sourceComponent) {
        const { events } = ctx.material?.getComponentMeta(componentName!)?.getMetadata().configure.supports as any;
        if (!events.find((o: any) => o.name === event)) {
          const componentDesc = getComponentDesc(componentName!, ctx);
          createLine(`${componentDesc}中没有发现${event}事件，请检查后重新输入。`);
          return false;
        }
      } else if (event !== 'success' && event !== 'error' && event !== 'finally') {
        createLine(`${event}事件不存在，请检查后重新输入。`);
        return false;
      }
    }

    if (parseEvent() === false) {
      return;
    }


    async function parseAction() {
      createLine(`开始分析动作`);
      if (action.name === 'ComponentMethod') {
        const { component, method } = action;

        if (!component) {
          createLine(`组件为空，终止分析`);
          return false;
        }

        if (!ctx.material.getComponentMetasMap().has(component)) {
          createLine(`组件${component}不存在，终止分析`);
          return false;
        }

        const targetComponents: any[] = [];

        getComponentsByName(componentsTree, component, targetComponents);

        const componentDesc = getComponentDesc(component, ctx);

        if (targetComponents.length === 0) {
          createLine(`画布中没有发现${componentDesc}组件，已为你自动生成`);

          const node = ctx.project.currentDocument?.createNode({
            id: v4(),
            componentName: component,
            props: ctx.material?.getComponentMeta(component!)?.getMetadata()?.snippets?.[0]?.schema?.props,
          })

          ctx.project.currentDocument?.insertNode(ctx.project.currentDocument.root!, node!);

          targetComponents[0] = node;
        } else if (targetComponents.length > 1) {
          createLine(`画布中发现多个${componentDesc}组件，请先选择一个`);
          try {
            const selectComponent = await showSelect() as string;
            const component = ctx.project.currentDocument?.getNodeById(selectComponent)!;
            createLine('已选择组件:' + component.componentName);
            targetComponents[0] = component;
          } catch {
            createLine('取消选择，已为你自动选择');
          }
        }

        const { methods } = ctx.material?.getComponentMeta(component!)?.getMetadata().configure.supports as any;

        if (!methods.find((o: any) => o.name === method)) {
          createLine(`${componentDesc}中没有发现${method}方法，请检查后重新输入。`);
          return false;
        }

        eventChildren = getEventFlow("ComponentMethod", {
          componentId: targetComponents[0].id,
          method,
        },
          lastEventChildren,
          event,
          sourceComponent
        );
      } else if (action.name === 'openPage') {
        eventChildren = getEventFlow(action.name, {
          url: {
            type: 'static',
            value: action.url
          }
        }, lastEventChildren, event, sourceComponent);
      } else if (action.name === 'showMessage') {
        eventChildren = getEventFlow(action.name, {
          type: {
            type: 'static',
            value: action.type
          },
          text: {
            type: 'static',
            value: action.content
          }
        }, lastEventChildren, event, sourceComponent);
      } else if (action.name === 'setTimeout') {
        eventChildren = getEventFlow(action.name, {
          timer: {
            type: 'static',
            value: action.timer
          },
        }, lastEventChildren, event, sourceComponent);
      }
    }

    if (await parseAction() === false) {
      return;
    }

    async function parseChildEventFlow() {
      if (action?.onSuccess) {
        await parseEventFlow({
          event: 'success',
          action: action.onSuccess,
        }, eventChildren);
      } else if (action.onError) {
        await parseEventFlow({
          event: 'error',
          action: action.onError,
        }, eventChildren);
      } else {
        const { root } = eventChildren;
        const { sourceComponent, eventName } = root;

        sourceComponent.props.setPropValue(eventName, root);
        createLine((
          <span>
            事件绑定完成，可以直接<a onClick={doPreview}>预览</a>
          </span>
        ));
      }
    }

    await parseChildEventFlow();

  }


  useEffect(() => {
    parseEventFlow(message.content)
  }, [message])


  return (
    <div
      style={{
        marginTop: 20,
        backgroundColor: 'rgb(244, 246, 248)',
        borderRadius: 6,
        padding: '8px 12px',
        minWidth: '100px',
      }}
    >
      {message.status === 'loading' ? <> <Spin /> 正在分析输入内容</> : message.status === 'success' ? (
        lines
          .map(line => (
            <div>{line.type === 'string' ? line.value : line.value}</div>
          ))
      ) : '分析失败，请重新输入。'}
      <Modal
        zIndex={1000000}
        title="选择组件"
        open={selectOpen}
        onCancel={() => {
          setSelectOpen(false)
          selectReject.current && selectReject.current(null)
        }}
        footer={null}
        styles={{ body: { minHeight: 200 } }}
        destroyOnClose
      >
        <ComponentTreeSelect
          style={{ width: 200 }}
          onSelect={(ids: string) => {
            selectResolve.current && selectResolve.current(ids[0]);
            setSelectOpen(false);
          }}
          options={[{ label: '2', value: '2' }]}
          ctx={ctx}
        />
      </Modal>
    </div>
  )
}

export default AIMessageContent;


