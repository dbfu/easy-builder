import { filterPackages } from '@alilc/lowcode-plugin-inject';
import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { message } from 'antd';
import { v4 } from "uuid";

export const getEventFlow = (
  action: string,
  actionParams: any,
  children?: any,
  eventName?: string,
  sourceComponent?: any
) => {
  const _children = [
    {
      type: "action",
      id: v4(),
      label: "组件方法",
      key: "action",
      menus: [
        {
          label: "成功",
          key: "success",
          nodeType: "event",
          nodeName: "成功",
          eventKey: "success",
        },
        {
          label: "失败",
          key: "error",
          nodeType: "event",
          nodeName: "失败",
          eventKey: "error",
        },
        {
          label: "成功或失败",
          key: "finally",
          nodeType: "event",
          nodeName: "成功或失败",
          eventKey: "finally",
        },
      ],
      config: {
        type: action,
        config: actionParams || {
          componentId: 1,
          method: action,
        },
      },
    },
  ];

  const root = {
    type: "flow",
    eventName,
    sourceComponent,
    value: {
      id: "root",
      label: "开始",
      type: "start",
      menus: [
        {
          key: "action",
          label: "动作",
          nodeType: "action",
          nodeName: "动作",
        },
        {
          key: "condition",
          label: "条件",
          nodeType: "condition",
          nodeName: "条件",
        },
      ],
      children: _children,
    },
  };

  if (children) {
    children.children[0].children = [
      {
        type: "event",
        id: v4(),
        label: "成功",
        key: "success",
        menus: [
          {
            key: "action",
            label: "动作",
            nodeType: "action",
            nodeName: "动作",
            eventKey: "success",
          },
          {
            key: "condition",
            label: "条件",
            nodeType: "condition",
            nodeName: "条件",
            eventKey: "success",
          },
        ],
        eventKey: "success",
        children: _children,
      },
    ];
    return {
      ...children,
      children: _children,
    };
  }

  return {
    root,
    children: _children,
  };
};

export const getComponentsByName = (
  componentsTree: any[],
  name: string,
  result: any[]
) => {
  (componentsTree || []).forEach((component) => {
    if (typeof component !== "string" && component.componentName === name) {
      result.push(component);
    }
    getComponentsByName(component.children || [], name, result);
  });
};

export const getComponentDesc = (componentName: string, ctx: IPublicModelPluginContext) => {
  const componentDesc = ctx.material.getComponentMetasMap().get(componentName)?.title['zh-CN'] || componentName;
  return componentDesc;
}



export const saveSchema = async (scenarioName: string = 'unknown', ctx: any) => {
  setProjectSchemaToLocalStorage(scenarioName, ctx);
  await setPackagesToLocalStorage(scenarioName, ctx);
  message.success('成功保存到本地');
};


const getLSName = (scenarioName: string, ns: string = 'projectSchema') => `${scenarioName}:${ns}`;

export const getProjectSchemaFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName)) || '{}');
}

const setProjectSchemaToLocalStorage = (scenarioName: string, ctx: any) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  window.localStorage.setItem(
    getLSName(scenarioName),
    JSON.stringify(ctx.project.exportSchema(IPublicEnumTransformStage.Save))
  );
}

const setPackagesToLocalStorage = async (scenarioName: string, ctx:any) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  const packages = await filterPackages(ctx.material.getAssets().packages);
  window.localStorage.setItem(
    getLSName(scenarioName, 'packages'),
    JSON.stringify(packages),
  );
}

export const getPackagesFromLocalStorage = (scenarioName: string) => {
  if (!scenarioName) {
    console.error('scenarioName is required!');
    return;
  }
  return JSON.parse(window.localStorage.getItem(getLSName(scenarioName, 'packages')) || '{}');
}

