import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types';
import { BorderlessTableOutlined } from '@ant-design/icons';
import Editor, { CommonPlaceholderThemes } from '@byteplan/bp-script-editor';
import { ConfigProvider, Modal, Tabs, Tooltip, Tree } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React, { useMemo, useRef, useState } from 'react';
import { functions } from './functions';

const placeholderTypes = {
  ComponentValue: 'C',
};

const placeholderThemes = {
  [placeholderTypes.ComponentValue]: CommonPlaceholderThemes.blue,
};

export default function Dialog({
  config: { props: { ctx } }, open, setOpen, onSave, defaultScriptValue }: {
    config: {
      props: { ctx: IPublicModelPluginContext }
    },
    open: boolean,
    setOpen: (open: boolean) => void,
    onSave: (scriptValue: string) => void,
    defaultScriptValue?: string
  },
) {

  const [editorVisible, setEditorVisible] = useState(false);
  const editorRef = useRef<any>();
  const [scriptValue, setScriptValue] = useState(defaultScriptValue);

  const formatTreeData = (nodes: any[]) => {
    return nodes.map(node => {

      const { values } = ctx.material.getComponentMeta(node.componentName).getMetadata().configure.supports || {} as any;

      const componentName = ctx.material.getComponentMetasMap().get(node.componentName)?.title['zh-CN'] || node.componentName;

      return {
        title: componentName,
        key: node.id,
        selectable: false,
        children: values ? [...values.map(v => ({
          title: v.desc,
          key: `${node.id}-${v.name}`,
          icon: <BorderlessTableOutlined />,
          parentId: node.id,
          parentComponentName: componentName,
          id: v.name,
        })), ...formatTreeData(node.children || [])] : formatTreeData(node.children || [])
      }
    })
  }


  const treeData = useMemo(() => {

    const schema = ctx.project.exportSchema(IPublicEnumTransformStage.Save);
    return formatTreeData(schema.componentsTree)

  }, [open])


  const onValueChange = (value: string) => {
    setScriptValue(value);
  }

  return (
    <ConfigProvider locale={zhCN}>
      <Modal
        styles={{ body: { padding: '20px 0', minHeight: 300 } }}
        title="变量绑定"
        onCancel={() => setOpen(false)}
        open={open}
        afterOpenChange={() => { setEditorVisible(true) }}
        width='65vw'
        onOk={() => {
          onSave && onSave(scriptValue)
        }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ width: '360px' }}>
            <Tabs
              tabPosition="left"
              items={[{
                label: '组件值',
                key: '1',
                forceRender: true,
                children: (
                  editorVisible && (
                    <Tree
                      treeData={treeData}
                      defaultExpandAll
                      showIcon
                      onSelect={(_, { node }: any) => {
                        if (!editorRef.current) return;
                        editorRef.current?.insertText(
                          `[[${placeholderTypes.ComponentValue}.${node.parentComponentName}:${node.parentId}.${node.title}:${node.id}]] `
                        )
                      }}
                    />
                  )
                )
              }, {
                label: '函数',
                key: '2',
                forceRender: true,
                children: (
                  editorVisible && (
                    <Tree
                      treeData={functions as any}
                      fieldNames={{ title: 'label', key: 'label' }}
                      defaultExpandAll
                      showIcon
                      titleRender={(node: any) => (
                        <Tooltip
                          getPopupContainer={node => node.parentElement}
                          placement="right"
                          title={node.detail}
                          key={node.label}
                        >
                          {node.label}
                        </Tooltip>
                      )}
                      onSelect={(_, { node }: any) => {
                        if (!editorRef.current) return;
                        editorRef.current.insertText(node.template, true);
                      }}
                    />
                  )
                )
              }]}
            />
          </div>
          <div style={{ flex: 1 }}>
            {open && (
              <Editor
                completions={[]}
                onValueChange={onValueChange}
                placeholderThemes={placeholderThemes}
                functions={functions}
                height="55vh"
                mode="name"
                defaultValue={defaultScriptValue}
                keywords={[]}
                ref={editorRef}
              />
            )}
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  )
}