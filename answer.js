/*
周六 15.30 开始读题
16:00 读完了这几个题 决定答三道中文题
*/

/*
将输入的数组组装成一颗树状的数据结构，时间复杂度越小越好。要求程序具有侦测错误输入的能力。注意输入数组是无序的。
*/

// 周六 16.15 开始
// 周六16.50 完成

function getTreeFromFlat(arr) {
  if (!arr || !Array.isArray(arr)) return "请输入有效数组参数";
  if (arr.length < 2) {
    return arr;
  }
  let temp = {};
  let result = [];
  let errorData = [];
  for (let i = 0; i < arr.length; i++) {
    const { id } = arr[i];
    temp[id] = arr[i];
  }
  for (let id in temp) {
    const current = temp[id];
    const { parentId } = current;
    //   第一级数据没有parentID
    if (parentId) {
      // 一级的子集必然在temp中 不在的就是错误数据
      if (temp[parentId]) {
        if (!temp[parentId].children) {
          temp[parentId].children = [];
        }
        temp[parentId].children.push(current);
      } else {
        errorData.push(current);
      }
    } else {
      result.push(current);
    }
  }
  return {
    result,
    about: {
      errorData,
      reason: "无关联型数据",
    },
  };
}

// 周六16.50开始
// 17.20 完成 中途接了一个电话

[
  { id: 1 },
  { id: 2, before: 1 }, // 这里 before 的意思是自己要排在 id 为 1 的元素前面
  { id: 3, after: 1 }, // 这里 after 的意思是自己要排在 id 为 1 元素后面
  { id: 5, first: true },
  { id: 6, last: true },
  { id: 7, after: 8 }, // 这里 after 的意思是自己要排在 id 为 8 元素后面
  { id: 8 },
  { id: 9 },
];

function mySort(data) {
  let temp = [];
  let otherData = [];
  let lastData = [];
  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    if (current.first || current.last || current.before || current.after) {
      otherData.push(current);
    } else {
      temp.push(current);
    }
  }
  for (let j = 0; j < otherData.length; j++) {
    const current = otherData[j];
    const { first, last, before, after } = current;
    if (first) {
      temp.unshift(current);
    } else if (last) {
      lastData.push(current);
    } else {
      const index = temp.findIndex(
        (item) => item.id === before || item.id === after
      );
      if (before) {
        temp.splice(index > 0 ? index - 1 : 0, 0, current);
      } else if (after) {
        temp.splice(index + 1, 0, current);
      }
    }
  }
  return temp.concat(lastData);
}

/*
5 设计事件总线

*/
// 17.40 开始
// 21.00 完成
//  难度一二很好实现 发布订阅就可以  在设计 api 和数据结构并打印出这次 trigger 内部所有发生的事件和监听信息 这块花费了很长时间
//  如果始终使用一个方法trigger  在判断是内部调用还是外部调用这块没有找到思路 想着用链表或者类似模拟函数执行栈 但最终没找到方法
//  非常抱歉 这块确实没有找到合适的办法 想了两个多小时还是没有思路能够走通全过程
//  最终只能这样变相处理了 内部调用换一个方法 在添加订阅时 将内部所有调用存储起来 在第一次外部调用时 找到内部最后一层内部调用 最后解析成树形结构
class MyBus {
  constructor() {
    this.listeners = {};
  }
  listen(event, call) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    const triggerCall = { eventName: event, callName: call.name, children: [] };
    //   判断内部是否有trigger事件 记录下来
    if (`${call}`.indexOf("this.innerTrigger(") > -1) {
      const triggerCallArr = `${call}`.split("this.innerTrigger(");
      for (let i = 1; i < triggerCallArr.length; i++) {
        const currentEventName = triggerCallArr[i].split(")")[0];
        triggerCall.children.push({
          eventName: currentEventName.substring(1, currentEventName.length - 1),
        });
      }
    }
    //   每次监听事件 保存内部调用trigger的事件 保存事件和回调
    this.listeners[event].push({
      callBack: call,
      callName: call.name,
      triggerCall,
    });
  }

  innerTrigger(event, ...args) {
    const currentEvent = this.listeners[event];
    if (currentEvent && currentEvent.length) {
      currentEvent.forEach(
        ({ callBack, callName, triggerCall: { eventName, children } }) => {
          callBack.call(this, ...args);
        }
      );
    }
  }

  trigger(event, ...args) {
    const currentEvent = this.listeners[event];

    if (currentEvent && currentEvent.length) {
      currentEvent.forEach(
        ({ callBack, callName, triggerCall: { eventName, children } }) => {
          //   内部没有trigger
          let isError = false;
          if (children.length === 0) {
            console.log(
              JSON.stringify({
                event: eventName,
                children: { callback: callName },
              })
            );
          } else {
            //   找到内部trigger的最后一个事件 平型数据存储
            const temp = [{ id: eventName, callName, parentId: null }];
            // 递归查找
            const getNext = (children, parentId) => {
              for (var k = 0; k < children.length; k++) {
                const nextEventName = children[k].eventName;
                if (children.length > 0 && this.listeners[nextEventName]) {
                  this.listeners[nextEventName] &&
                    this.listeners[nextEventName].forEach((item) => {
                      const {
                        callName,
                        triggerCall: { eventName, children },
                      } = item;

                      if (temp.find((item) => item.id === eventName)) {
                        isError = true;
                        console.log("请勿循环引用");
                      } else {
                        temp.push({
                          id: eventName,
                          callName,
                          parentId,
                        });
                        getNext(children, eventName);
                      }
                    });
                } else {
                  console.log(getTreeFromFlat(temp));
                }
              }
            };
            getNext(children, eventName);
          }
          if (!isError) {
            callBack.call(this, ...args);
          }
        }
      );
    }
  }

  remove(event, call) {
    this.listeners[event] = this.listeners[event].filter(
      (item) => item !== call
    );
  }
  removeAll(event) {
    delete this.listeners[event];
  }
}

/**
 * 
bus.listen('a',function ca1(){console.log('a')});
bus.listen('b',function ca2(){console.log('b',this);this.innerTrigger('c')});
bus.listen('c',function ca3(){console.log('c');this.innerTrigger('d')});
 * 
 * 
 */
