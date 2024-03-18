import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import React, { useEffect, useRef, useState } from 'react';
import Dialog from './dialog';


export default function VariableDialog({ config: { props: { ctx } }, }: { config: { props: { ctx: IPublicModelPluginContext } } }) {

  const [visible, setVisible] = useState(false);
  const [scriptValue, setScriptValue] = useState('');

  const fieldRef = useRef<any>();

  useEffect(() => {
    ctx.event.on('common:variableBindDialog.openDialog', ({ field }) => {
      setScriptValue(field.getValue()?.script || '')
      setVisible(true);
      fieldRef.current = field;
    });
  }, []);

  const onSave = (scriptValue: string) => {
    if (!fieldRef.current) return;
    const fieldValue = fieldRef.current.getValue();
    fieldRef.current?.setValue({
      type: 'variable',
      value: '[[变量]]',
      script: scriptValue,
      mock:
        Object.prototype.toString.call(fieldValue) === '[object Object]'
          ? fieldValue.mock
          : fieldValue,
    });
    setVisible(false);
    setScriptValue(fieldRef.current.getValue());
  }


  return (
    <Dialog
      defaultScriptValue={scriptValue}
      open={visible}
      setOpen={setVisible}
      onSave={onSave}
      config={{ props: { ctx } }}
      key={scriptValue}
    />
  )
}