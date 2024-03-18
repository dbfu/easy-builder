import { useUpdateEffect } from 'ahooks';
import { Form, Input, Select, Switch } from 'antd';
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import ComponentMethodSetting from './component-method';
import VariableFormItem from './form-item/variable';

const FormItem = Form.Item;

const EventActionTypesDesc: any = {
  ShowMessage: '显示消息',
  ComponentMethod: '组件方法',
  SetVariable: '设置变量',
  ExecScript: '执行脚本',
  Request: '请求接口',
  Confirm: '显示确认框',
}

const ActionSettingPanel = ({
  graphRef,
  curModel,
  setSettingOpen,
  ctx,
  actions,
}: { graphRef: any, curModel: any, setSettingOpen: any, ctx: any, actions: any[] },
  ref: any
) => {

  const newActions = useMemo(() => {
    const componentMethodAction = {
      label: '组件方法',
      name: 'ComponentMethod',
      paramsSetter: ComponentMethodSetting,
    }
    return [componentMethodAction, ...actions]
  }, [actions])

  const [values, setValues] = useState<any>(curModel.current?.config || {});

  const [form] = Form.useForm();

  useUpdateEffect(() => {
    form.setFieldsValue({
      config: null,
    });
  }, [values.type, form]);

  useImperativeHandle(ref, () => {
    return {
      save: () => {
        form.submit();
      }
    }
  }, [form])

  function save(config: any) {

    let menus = [{
      label: '成功',
      key: 'success',
      nodeType: 'event',
      nodeName: '成功',
      eventKey: 'success',
    }, {
      label: '失败',
      key: 'error',
      nodeType: 'event',
      nodeName: '失败',
      eventKey: 'error',
    }, {
      label: '成功或失败',
      key: 'finally',
      nodeType: 'event',
      nodeName: '成功或失败',
      eventKey: 'finally',
    }];

    if (config.type === 'Confirm') {
      menus = [{
        label: '确认',
        key: 'confirm',
        nodeType: 'event',
        nodeName: '确认',
        eventKey: 'confirm',
      },
      {
        label: '取消',
        key: 'cancel',
        nodeType: 'event',
        nodeName: '取消',
        eventKey: 'cancel',
      }]
    }

    const nodeLabel = actions.find(o => o.name === values.type)?.label;

    graphRef.current.updateItem(curModel.current.id, {
      ...curModel.current,
      config,
      label: nodeLabel || '组件方法',
      menus,
    });
    setSettingOpen(false);
  }


  function valueChange(_: any, allValues: any) {
    setValues(allValues);
  }

  console.log(values, 'curModel.current?.config');

  const setters = useMemo(() => {
    console.log(values.type, 'type');
    return newActions.find(o => o.name === values.type)?.paramsSetter || [];
  }, [values?.type, newActions])

  console.log(setters, 'setters');


  function renderSetter(item: any) {
    if (item.type === 'input') {
      return (
        <Input />
      )
    } else if (item.type === 'switch') {
      return (
        <Switch />
      )
    } else if (item.type === 'select') {
      return (
        <Select options={item.options} />
      )
    }
  }


  return (
    <Form
      onValuesChange={valueChange}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      form={form}
      onFinish={save}
      initialValues={curModel.current?.config}
    >
      <FormItem label="动作类型" name="type">
        <Select
          options={newActions}
          fieldNames={{ label: 'label', value: 'name' }}
        />
      </FormItem>

      {Array.isArray(setters) ? setters.map((item: any) => {
        if (!item) return null;
        const rules = item.required ? [{ required: true, message: '不能为空' }] : [];
        return (
          <FormItem
            label={item.label}
            name={['config', item.name]}
            rules={rules}
            initialValue={item.defaultValue}
            key={item.name}
          >
            <VariableFormItem ctx={ctx}>
              {renderSetter(item)}
            </VariableFormItem>
          </FormItem>
        )
      }).filter(o => o) : React.createElement(setters, { values, ctx })}


      {/* {actionMap[values.type] && React.createElement(actionMap[values.type], { values, ctx })} */}
    </Form>
  )
}

export default forwardRef(ActionSettingPanel);