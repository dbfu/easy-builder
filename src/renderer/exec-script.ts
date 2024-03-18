import lodash from 'lodash';
import { functions } from './functions';

export function execScript(script: string, ctx: any) {
  const { pageValue } = ctx;

  if (!script) return;

  const result = script.replace(/\[\[(.+?)\]\]/g, (_: string, $2: string) => {
    const [fieldType, ...rest] = $2.split('.');

    if (fieldType === 'C') {
      const keys = rest.map((t) => t.split(':')[1]);
      return `ctx.lodash.get(ctx.pageValue, "${keys.join('.')}")`;
    }

    return '';
  });

  const func = new Function('ctx', 'func', `return ${result}`);

  const funcs = functions.reduce<any>((prev, cur) => {
    if (cur.handle) {
      prev[cur.label] = cur.handle;
    }
    return prev;
  }, {});

  const funcResult = func(
    {
      pageValue,
      lodash,
    },
    funcs,
  );

  return funcResult;
}
