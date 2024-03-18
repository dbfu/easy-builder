import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Form, Select, TreeSelect } from 'antd';
import React, { useMemo } from 'react';

const FormItem = Form.Item;

const ComponentMethodSetting = ({ values, ctx }: { values: any, ctx: IPublicModelPluginContext }) => {

  const formatTreeData = (nodes: any[]) => {
    return nodes.map(node => {
      return {
        label: ctx.material.getComponentMetasMap().get(node.componentName)?.title['zh-CN'] || node.componentName,
        value: node.id,
        children: formatTreeData(node.children || [])
      }
    })
  }

  const treeData = useMemo(() => {
    const schema = ctx.project.exportSchema(IPublicEnumTransformStage.Save);
    console.log(schema.componentsTree, 'componentsTree');

    return formatTreeData(schema.componentsTree as any[]);
  }, []);

  const methods = useMemo(() => {
    if (!values?.config?.componentId) return [];
    const { componentId } = values?.config;
    const node = ctx.project.currentDocument.getNodeById(componentId);
    const { configure } = ctx.material.getComponentMeta(node.componentName).getMetadata() as any;
    return configure?.supports?.methods || [];
  }, [values?.config?.componentId]);

  return (
    <>
      <FormItem label="组件" name={['config', 'componentId']}>
        <TreeSelect
          treeData={treeData}
          treeDefaultExpandAll
        />
      </FormItem>
      {(methods) && (
        <FormItem label="方法" name={['config', 'method']}>
          <Select
            options={(methods || []).map(
              (method: any) => ({ label: method.desc, value: method.name })
            )}
          />
        </FormItem>
      )}
    </>
  )
}

export default ComponentMethodSetting;