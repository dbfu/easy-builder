import { CodeOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import Dialog from '../../../../variable-dialog/dialog';

function VariableFormItem({ children, onChange, value, ctx }: any) {

  const [dialogOpen, setDialogOpen] = useState(false);

  function changeHandle(value: any) {
    onChange && onChange({
      type: 'static',
      value: value.target ? value.target.value : value,
    });
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {React.cloneElement(children, {
          onChange: changeHandle,
          value: (value && value.type === 'static') ? value.value : undefined,
          disabled: (value?.type === 'variable' && value?.value) || children?.props?.disabled,
        })}
        <CodeOutlined
          onClick={() => setDialogOpen(true)}
          style={{ color: (value?.type === 'variable' && value?.value) ? 'gold' : '' }}
        />
      </div>
      <Dialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        defaultScriptValue={value?.type === 'variable' ? value?.value : ''}
        onSave={(scriptValue) => {
          onChange && onChange({
            type: 'variable',
            value: scriptValue,
            script: scriptValue,
          })
          setDialogOpen(false);
        }}
        config={{
          props: {
            ctx,
          },
        }}
      />
    </div>
  )
}

export default VariableFormItem;