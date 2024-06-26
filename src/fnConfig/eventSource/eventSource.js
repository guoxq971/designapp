import Cookie from 'js-cookie';
import { GRequest, METHOD, xsrfHeaderName } from '@/utils/request';
import { Notification } from 'element-ui';
import { getAes } from '@/utils/aes';
import { useNotifyStore } from '@/piniaStore/useNotify';
import { useTool } from '@/utils/tool';

const openUrl = '/api/notify-web/sse/openConnect';
const closeUrl = '/notify-web/sse/closeConnect';
// const closeUrl = '/api/notify-web/sse/close/';

let source;
export const createEventSource = () => {
  function openSse() {
    //  token
    const token = Cookie.get(xsrfHeaderName);

    if (window.EventSource) {
      // 建立连接  http协议，有代理的走代理
      source = new EventSource(`${openUrl}?token=${token}`);
      // source = new EventSource('http://127.0.0.1:8908/notify-web/sse/openConnect?token=' + token);
      /**
       * 连接一旦建立，就会触发open事件
       * 另一种写法：source.onopen = function (event) {}
       */
      source.addEventListener(
        'open',
        function(e) {
          console.log('建立连接...');
        },
        false,
      );
      /**
       * 客户端收到服务器发来的数据
       * 另一种写法：source.onmessage = function (event) {}
       */
      source.addEventListener('message', function(e) {
        console.log('客户端收到服务器发来的数据', e.data, e);
        // {"belong":"1","createTime":"2024-05-16 19:57:06","tableId":"1791075378947850242","remindUrl":"baidu.com","remindUrlType":"0","title":"充值成功","content":"线上充值金额¥ 12.22","belongName":"订单通知"}
        const data = JSON.parse(e.data);
        if (data.belong) {
          Notification({
            title: data.title,
            message: data.content,
            type: 'success',
          });
          useNotifyStore().getNoReadCount();
        }
      });

      // 监听窗口关闭事件，主动去关闭sse连接，如果服务端设置永不过期，浏览器关闭后手动清理服务端数据
      window.onbeforeunload = function() {
        closeSse();
      };

      /**
       * 如果发生通信错误（比如连接中断），就会触发error事件
       * 或者：
       * 另一种写法：source.onerror = function (event) {}
       */
      source.addEventListener(
        'error',
        function(e) {
          if (e.readyState === EventSource.CLOSED) {
            // console.log('连接关闭');
          } else {
            console.log(e);
          }
        },
        false,
      );
    } else {
      console.log('你的浏览器不支持SSE');
    }
  }

  // 关闭Sse连接  https协议，有代理的走代理
  // http://127.0.0.1:8908/notify-web/sse/close/1
  function closeSse() {
    if (source) {
      source.close();
      source = null;
      return GRequest(closeUrl, METHOD.GET);
      // const httpRequest = new XMLHttpRequest();
      // httpRequest.open('GET', `${closeUrl}?token=${token}`, true);
      // // headers
      // httpRequest.setRequestHeader('Content-Type', 'application/json');
      // const { key, sign } = getAes();
      // httpRequest.setRequestHeader('X-Ca-Key', key);
      // httpRequest.setRequestHeader('X-Ca-Sign', sign);
      // httpRequest.send();
      // console.log('close');
    }
    return Promise.resolve();
  }

  // 是否已经登陆，如果已经登陆，建立连接
  function authOpenSse() {
    if (useTool.sameCookie()) {
      openSse();
    }
  }

  return {
    authOpenSse,
    openSse,
    closeSse,
  };
};
