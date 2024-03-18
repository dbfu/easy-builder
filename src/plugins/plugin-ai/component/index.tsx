import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { SendOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, Modal } from 'antd';
import { useState } from "react";
import { v4 } from 'uuid';
import AIMessageContent, { AIMessage } from './ai-message-content';

import './index.scss';

interface UserMessage {
  id: string,
  role: 'user',
  content: string,
  status: 'success',
}

const RequestUrl = 'https://ai.fluxyadmin.cn';

export default function AIContent({ ctx }: { ctx: IPublicModelPluginContext }) {

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<(UserMessage | AIMessage)[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendRequest(input: string) {
    setMessages(prev => [
      ...prev,
      {
        id: v4(),
        role: 'user',
        content: input,
        status: 'success',
      },
      {
        id: v4(),
        role: 'ai',
        status: 'loading',
      },
    ]
    );

    setInputValue('');
    setLoading(true);
    try {
      const result = await window.fetch(`${RequestUrl}?input='` + input).then(res => res.json());
      setMessages(prev => {
        const lastMessage = prev.pop();

        if (!lastMessage) {
          return prev;
        }

        lastMessage.status = 'success';
        lastMessage.content = result;

        return [...prev, { ...lastMessage }];
      });
    } catch {
      setMessages(prev => {
        const lastMessage = prev.pop();

        if (!lastMessage) {
          return prev;
        }

        lastMessage.status = 'error';

        return [...prev, { ...lastMessage }];
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Button
        onClick={
          () => {
            setOpen(true);
          }
        }
        type="primary"
      >
        AI助手
      </Button>
      <Modal
        title="AI助手"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width="70vw"
        styles={{
          body: {
            height: '60vh',
            overflowY: 'auto',
          }
        }}
        maskClosable={false}
        footer={(
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              style={{ flex: 1 }}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.keyCode === 13) {
                  sendRequest(inputValue);
                }
              }}
            />
            <Button
              onClick={() => sendRequest(inputValue)}
              type='primary'
              disabled={loading || !inputValue}
              icon={<SendOutlined />}
            >
              发送
            </Button>
          </div>
        )}
      >
        {!messages.length && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              height: '60vh',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div>不知道输入啥？试试下方输入</div>
            <Button
              onClick={() => {
                sendRequest('点击按钮，弹出弹框');
              }}
            >
              点击按钮，弹出弹框
            </Button>
            <Button
              onClick={() => {
                sendRequest('点击按钮，弹出弹框，一秒后关闭。');
              }}
            >
              点击按钮，弹出弹框，一秒后关闭。
            </Button>
          </div>
        )}
        {!!messages.length && (
          <div
            className='message-box'
          >
            {messages.map(item => {
              if (item.role === 'user') {
                return (
                  <div
                    key={item.id}
                    className='user-message'
                  >
                    <Avatar style={{ backgroundColor: '#87d068' }}>
                      我
                    </Avatar>
                    <div className='user-message-content'>
                      {item.content}
                    </div>
                  </div>
                )
              } else {
                return (
                  <div
                    key={item.id}
                    className='ai-message'
                  >
                    <Avatar style={{ backgroundColor: '#1677ff' }}>
                      AI
                    </Avatar>
                    <AIMessageContent message={item} ctx={ctx} />
                  </div>
                )
              }
            })}
          </div>
        )}
      </Modal>
    </div>
  )
}