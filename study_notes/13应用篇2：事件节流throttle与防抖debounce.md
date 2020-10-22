## 应用篇2：事件节流throttle与防抖debounce

scroll事件、resize事件、鼠标事件（mousemove、mouseover等）、键盘事件（keyup、keydown等）都存在被频繁触发的风险。

频繁触发回调导致的大量计算会引发页面的抖动甚至卡顿。=》需要一些手段来控制事件被触发的频率



###”节流“与”防抖“的本质

这两者都以**闭包**的形式存在。

通过对事件对应的回调函数进行包裹、以自由变量的形式缓存时间信息，最后用setTimeout来控制事件的触发频率。



### Throttle：第一个人说了算

**中心思想**：在某段时间内，不管触发了多少次回调，都只认第一次，并在计时结束时给予响应。

所谓的”节流“，是通过在一段时间内**无视后来产生的回调请求**来实现的。——直到”一段时间“到了，第一次触发的scroll事件对应的回调才会执行，而”这一段时间内“触发的后续scroll回调都会被节流阀无视掉

```javascript
/**
 * 实现一个throttle
 */
function throttle(fn, interval) {
  // last为上一次触发回调的时间
  let last = 0;
  
  return function () {
    // 保留调用时的this上下文
    let context = this;
    // 保留调用时传入的参数
    let args = arguments;
    // 记录本次触发回调的时间
    let now = Date.now();
    
    // 判断上次触发的时间和本次触发的时间差是否小于设定的时间间隔的阈值
    if(now - last >= interval) {
      // 如果大于，则执行回调
      last = now;
      fn.apply(context, args);
    }
  }
}

// 用throttle来包装scroll的回调
const better_scroll = throttle(()=> {
  console.log(Date.now());
}, 1000);
window.addEventListener('scroll', better_scroll);
```



### Debounce：最后一个人说了算

**中心思想**：在某段时间内，不管触发了多少次回调，都只认最后一次。

debounce会为每一个回调任务设定新的定时器。

```javascript
/**
 * 实现一个debounce：
 * 在用户不触发事件时才触发动作？
 */
function debounce(fn, delay) {
  // 定时器
  let timer = null;
  
  return function() {
    // 保留调用时的this上下文
    let context = this;
    // 保留调用时传入的参数
    let agrs = arguments;
    
    // 每次事件被触发时，都去清楚之前的旧定时器
    if(timer) clearTimeout(timer);
    // 设定新定时器
    timer = setTimeout(()=> {
      fn.apply(context, args);
    }, delay);
  }
}

// 用debounce来包装scroll的回调
const better_scroll = debounce(() => console.log('触发了滚动事件'), 1000);
window.addEventListener('scroll', better_scroll);
```



### 用Throttle来优化Debounce

debounce的问题在于它”太有耐心了“。如果用户的操作十分频繁——每次都不等debounce设置的delay时间结束就进行下一次操作，**回调函数被延迟了不计其数次**——频繁的延迟会导致用户迟迟得不到响应，用户同样会产生”这个页面卡死了“的观感。

借助throttle的思想，打造一个有底线的debounce——delay时间内，可以重新生成定时器；但只要delay的时间到了，必须要给用户一个响应。=》加强版throttle

```javascript
/**
 * 实现加强版throttle：
 * 如果时间间隔小于delay，则以最后一次触发的回调为准（即执行debounce）；如果大于delay，则执行第一次触发的回调（即throttle）。适当增加反馈频率
 */
function throttle(fn, delay) {
  let last = 0, timer = null;
  
  return function() {
    let context = this;
    let args = arguments;
    // 记录本次触发回调的时间
    let now = Date.now();
    
    // 判断上次触发的时间和本次触发的时间差是否小于时间间隔的阈值
    if(now - last < delay) {
      // 如果小于，则为本次触发操作设立一个新的定时器
      clearTimeout(timer); // 放在if之上？？如果用户操作了多次只得到一次反馈，也会造成困扰？？根据预期效果、结合具体业务需求
      timer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, delay);
    } else {
      // 如果超出了设定的时间间隔阈值，就不等了，无论如何都要给用户一次响应
      last = now;
      fn.apply(context, args);
    }
  }
}
const better_scroll = throttle(()=> console.log('触发了scroll事件'), 1000);
window.addEventListener('scroll', better_scroll);
```



### 补充

节流throttle：响应第一次回调任务后，一段时间内不响应——场景：比input、keyup更频繁的事件中，如resize、touchmove、mousemove、scroll

防抖debounce：一段时间内连续多次触发，只响应最后一次回调任务。（把多个信号合并为一个信号）——场景：输入监听事件（校验）、按钮点击事件

普通throttle不能保证”发车“，当所有事件都在interval之内而后面不再有事件发生的时候

[函数防抖与函数节流](https://zhuanlan.zhihu.com/p/38313717)

