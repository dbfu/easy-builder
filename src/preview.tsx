import { createFetchHandler } from '@alilc/lowcode-datasource-fetch-handler';
import { injectComponents } from '@alilc/lowcode-plugin-inject';
import { AssetLoader, buildComponents } from '@alilc/lowcode-utils';
import { Spin } from 'antd';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { getPackagesFromLocalStorage, getProjectSchemaFromLocalStorage } from './services/mockService';

import ReactRender from './renderer';
import { execScript } from './renderer/exec-script';
import { parseProps } from './renderer/utils';


const getScenarioName = function () {
  if (location.search) {
    return new URLSearchParams(location.search.slice(1)).get('scenarioName') || 'index';
  }
  return 'index';
}


const SamplePreview = () => {
  const [data, setData] = useState({});

  const [pageValue, setPageValue] = useState({});
  const componentRefs = useRef<any>({});

  async function init() {
    const scenarioName = getScenarioName();
    const packages = getPackagesFromLocalStorage(scenarioName);
    const projectSchema = getProjectSchemaFromLocalStorage(scenarioName);
    const { componentsMap: componentsMapArray, componentsTree } = projectSchema;
    const componentsMap: any = {};
    componentsMapArray.forEach((component: any) => {
      componentsMap[component.componentName] = component;
    });
    const schema = componentsTree[0];

    const libraryMap: any = {};
    const libraryAsset: any[] = [];
    packages.forEach(({ package: _package, library, urls, renderUrls }: any) => {
      libraryMap[_package] = library;
      if (renderUrls) {
        libraryAsset.push(renderUrls);
      } else if (urls) {
        libraryAsset.push(urls);
      }
    });

    const assetLoader = new AssetLoader();
    await assetLoader.load(libraryAsset);

    const components = await injectComponents(
      // @ts-ignore
      buildComponents(libraryMap, componentsMap)
    );



    setData({
      schema,
      components,
    });
  }

  const { schema, components } = data as any;

  if (!schema || !components) {
    init();
    return <Spin fullscreen />;
  }

  function getComponentRefs() {
    return componentRefs.current;
  }

  return (
    <div className="lowcode-plugin-sample-preview">
      <ReactRender
        className="lowcode-plugin-sample-preview-content"
        schema={schema}
        components={components}
        customCreateElement={(Component: any, props: any, children: any) => {
          // 给每个组件注入的上下文
          const ctx = {
            pageValue,
            setPageValue,
            getComponentRefs,
          };

          // 当组件配置了是否渲染为变量时，动态执行脚本，如果脚本返回 false，则不渲染
          if (props?.__inner__?.condition && props?.__inner__?.condition?.type === 'variable') {
            if (!execScript(props?.__inner__?.condition?.script, ctx)) return ;
          }

          // 解析 props
          const newProps = parseProps(props, ctx);

          // 渲染组件
          return React.createElement(Component, newProps, newProps.children || children);
        }}
        onCompGetRef={(schema: any, ref: any) => {
          // 存储每个组件的 ref实例
          componentRefs.current = {
            ...componentRefs.current,
            [schema.id]: ref,
          }
        }}
        appHelper={{
          requestHandlersMap: {
            fetch: createFetchHandler()
          }
        }}
      />
    </div>
  );
};

ReactDOM.render(<SamplePreview />, document.getElementById('ice-container'));
