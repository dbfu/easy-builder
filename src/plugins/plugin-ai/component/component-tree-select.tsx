import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
import { Tree } from 'antd';
import React from "react";

export default function ComponentTreeSelect({ ctx, onSelect }: any) {

  const formatTreeData = (nodes: any[]) => {
    return nodes.map(node => {
      return {
        title: ctx.material.getComponentMetasMap().get(node.componentName)?.title['zh-CN'] || node.componentName,
        key: node.id,
        children: formatTreeData(node.children || [])
      }
    })
  }

  const treeData = () => {
    const schema = ctx.project.exportSchema(IPublicEnumTransformStage.Save);
    console.log(schema.componentsTree, 'componentsTree');

    return formatTreeData(schema.componentsTree as any[]);
  };

  return (
    <Tree
      defaultExpandAll
      treeData={treeData()}
      onSelect={onSelect}
    />
  )
}