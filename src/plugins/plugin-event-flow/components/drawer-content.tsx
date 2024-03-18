import { IPublicEnumTransformStage, IPublicModelPluginContext, IPublicTypeRootSchema } from '@alilc/lowcode-types';
import { useMemo, useRef, useState } from "react";

import EventFlow from './flow-event';

import './drawer-content.scss';

import { Button, Select, Space, Tree, message } from 'antd';


function DrawerContent({ ctx, actions, onClose }: { ctx: IPublicModelPluginContext, actions: any[], onClose: () => void }) {

  const [selectComponentId, setSelectComponentId] = useState<string>();
  const [selectEventName, setSelectEvent] = useState<string>();

  const flowRef = useRef<any>();

  const treeData = useMemo(() => {
    const schema = ctx.project.exportSchema(IPublicEnumTransformStage.Save);
    return schema.componentsTree as IPublicTypeRootSchema[];
  }, []);

  const events = useMemo(() => {

    if (!selectComponentId) return [];

    // 通过当前选中的组件id，获取到组件
    const node = ctx.project.currentDocument?.getNodeById(selectComponentId)!;
    // 根据组件名称，获取组件的props配置
    const { props } = ctx.material?.getComponentMeta(node.componentName)?.getMetadata() || {};
    // 过滤出事件props
    return (props || []).filter(p => p.propType === 'func');

  }, [selectComponentId]);

  const flowData = useMemo(() => {

    if (!selectEventName || !selectComponentId) return null;

    const node = ctx.project.currentDocument?.getNodeById(selectComponentId)!;

    return node.getPropValue(selectEventName) ? node.getPropValue(selectEventName).type === 'flow' ? node.getPropValue(selectEventName).value : null : null;
  }, [selectEventName, selectComponentId]);


  const save = () => {

    if (!selectComponentId || !selectEventName) return;

    // 获取流程编排数据
    const data = flowRef.current.save();
    // 根据id获取节点
    const node = ctx.project.currentDocument?.getNodeById(selectComponentId)!;
    // 给节点某个属性设置值
    node.props?.setPropValue(selectEventName, {
      type: 'flow',
      value: data,
    });

    message.success('保存成功');
  }


  return (
    <div className='container'>
      <div className='left'>
        <Tree
          titleRender={(node: any) => {
            return (
              <div style={{ whiteSpace: 'nowrap' }}>
                {(ctx.material?.getComponentMetasMap()?.get(node.componentName)?.title as any)?.['zh-CN'] as string || node.componentName}
              </div>
            );
          }}
          fieldNames={{ title: 'componentName', key: 'id', children: 'children' }}
          treeData={treeData}
          defaultExpandAll
          style={{ width: 240, overflowX: 'auto' }}
          onSelect={(selectKeys) => {
            setSelectComponentId(selectKeys[0] as string);
            setSelectEvent(undefined);
          }}
        />
      </div>
      <div className='right'>
        {selectComponentId && (
          <div style={{ position: 'absolute', top: 20, left: 20 }}>
            <Select
              onChange={setSelectEvent}
              fieldNames={{ label: 'name', value: 'name' }}
              style={{ width: 200 }} options={events}
              value={selectEventName}
              placeholder="请选择事件"
            />
          </div>
        )}
        {selectComponentId ? (
          selectEventName ? (
            <>
              <div
                style={{ position: 'absolute', top: 20, right: 20 }}
              >
                <Space>
                  <Button
                    onClick={() => {
                      save();
                    }}
                    type='primary'
                  >
                    保存
                  </Button>
                  <Button
                    onClick={() => {
                      save();
                      onClose && onClose();
                    }}
                  >
                    保存并关闭
                  </Button>
                </Space>

              </div>
              <EventFlow
                ctx={ctx}
                key={selectEventName}
                ref={flowRef}
                flowData={flowData}
                actions={actions}
              />
            </>
          ) : (
            <div
              style={{
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px',
                fontWeight: 600,
                height: '100%',
              }}
            >
              请先选择事件
            </div>
          )
        ) : (
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              fontSize: '18px',
              fontWeight: 600,
              height: '100%',
            }}
          >
            请先选择组件
          </div>
        )}
      </div>
    </div>
  );
}

export default DrawerContent
