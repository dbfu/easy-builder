/* eslint-disable */
import { CodeOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Dialog from '../../../variable-dialog/dialog';

function ConditionSettingPanel({ graphRef, curModel, setSettingOpen, ctx }: any, ref: any) {
  const [data, setData] = useState(curModel.current?.config || []);

  const [conditionVisible, setConditionVisible] = useState(false);
  const [curIndex, setCurIndex] = useState(0);
  const [conditionValue, setConditionValue] = useState('');

  useImperativeHandle(ref, () => {
    return {
      save: () => {
        graphRef.current.updateItem(curModel.current.id, {
          ...curModel.current,
          config: data,
          menus: data.map((item: any) => {
            return {
              key: item.id,
              label: item.name,
              nodeType: 'action',
              nodeName: '动作',
              conditionId: item.id,
            };
          }),
        });

        setSettingOpen && setSettingOpen(false);
      }
    }
  }, [data])


  function nameChange(value: any, index: number) {
    setData((prev: any) => {
      prev[index].name = value;
      return [...prev];
    });
  }

  function conditionChange(value: any, index: number) {
    setData((prev: any) => {
      prev[index].condition = value;
      return [...prev];
    });
  }


  return (
    <div>
      <div style={{ marginTop: 0 }}>
        <Space direction='vertical'>
          {data.map((item: any, index: number) => {
            return (
              <Space key={item.id}>
                <span>{index + 1}.</span>
                <Input
                  onChange={(e) => {
                    nameChange(e.target.value, index);
                  }}
                  value={item.name}
                  placeholder='条件名称'
                />
                <CodeOutlined
                  className='cursor-pointer'
                  onClick={() => {
                    setCurIndex(index);
                    setConditionVisible(true);
                    setConditionValue(item.condition || '');
                  }}
                  style={{ color: item.condition && 'gold' }}
                />
              </Space>
            );
          })}
        </Space>
      </div>
      <div style={{ marginTop: 20 }}>
        <Button
          onClick={() => {
            setData((prev: any) => [...prev, { id: new Date().getTime().toString() }]);
          }}
          type='primary'
        >
          添加条件
        </Button>
      </div>
      <Dialog
        key={curIndex}
        onSave={(scriptValue: string) => {
          conditionChange(scriptValue, curIndex);
          setConditionVisible(false);
        }}
        open={conditionVisible}
        setOpen={setConditionVisible}
        config={{
          props: {
            ctx,
          },
        }}
        defaultScriptValue={conditionValue}
      />
    </div>
  );
}

export default forwardRef(ConditionSettingPanel);
