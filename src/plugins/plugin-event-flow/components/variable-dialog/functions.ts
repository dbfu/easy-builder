/* eslint-disable no-template-curly-in-string */

import lodash from "lodash";

export const functions = [
  {
    label: "equal",
    template: "func.equal(${v1}, ${v2})",
    detail: "判断函数两个参数值是否相等",
    type: "function",
    handle: (v1: any, v2: any) => {
      return lodash.isEqual(v1, v2);
    },
  },
  {
    label: "if",
    template: "func.if(${p}, ${v1}, ${v2})",
    detail: "判断函数，p为条件，当p为真的时候，返回v1，当p为假的时候，返回v2",
    type: "function",
    handle: (p, v1, v2) => {
      return p ? v1 : v2;
    },
  },
  {
    label: "boolean",
    template: "func.boolean(${v})",
    detail:
      "会把false、null、0、空字符串、空对象、空数组转换成false，其他都是返回true",
    type: "function",
    handle: (v) => {
      if (Object.prototype.toString.call(v) === "[object Object]") {
        return !!Object.keys(v).length;
      }

      if (Array.isArray(v)) {
        return !!v.length;
      }

      if ([false, null, 0, ""].includes(v)) {
        return false;
      }

      return true;
    },
  },
  {
    label: "case",
    template: "func.case(${exp}, [${c1}, ${v1}, ${c2}, ${v2}, ${...}], ${def})",
    detail: "多组条件",
    type: "function",
    handle: (exp, rules, def) => {
      for (let i = 0; i < rules.length; i += 2) {
        if (exp === rules[i]) {
          return rules[i + 1];
        }
      }
      return def;
    },
  },
  {
    label: "isEmail",
    template: "func.isEmail(${v1})",
    detail: "判断内容是否是邮箱格式",
    type: "function",
    handle: (v1: any) => {
      if (typeof v1 !== "string") return false;
      return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(v1);
    },
  },
  {
    label: "isPhoneNumber",
    template: "func.isPhoneNumber(${v1})",
    detail: "判断内容是否是手机号格式",
    type: "function",
    handle: (v1: any) => {
      if (typeof v1 !== "string") return false;
      return /^1[3456789]\d{9}$/.test(v1);
    },
  },
  {
    label: "isUrl",
    template: "func.isUrl(${v1})",
    detail: "判断内容是url",
    type: "function",
    handle: (v1: any) => {
      if (typeof v1 !== "string") return false;
      return /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i.test(
        v1
      );
    },
  },
];
