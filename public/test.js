console.log('test.service.worker.cache');

// Service Worker会监听install事件，我们在其对应的回调里可以实现初始化的逻辑
self.addEventListener('install', event => {
	event.waitUntil(
		// 考虑到缓存也需要更新，open内传入的参数为缓存的版本号
		caches.open('test-v1').then(cache => {
			return cache.addAll([
				// 此处传入指定的需缓存的文件名
				'/test.html',
				'/test.css',
				'/test.js'
			])
		})
	)
})

// Service Worker会监听所有的网络请求，网络请求的产生触发的是fetch事件，我们可以在其对应的监听函数中
// 实现对请求的拦截，进而判断是否有对应到该请求的缓存，实现从Service Worker中取到缓存的目的
self.addEventListener('fetch', event => {
	event.respondWith(
		// 尝试匹配该请求对应的缓存值
		caches.match(event.request).then(res => {
			// 如果匹配到了，调用Service Worker缓存
			if(res) {
				return res;
			}
			// 如果没匹配到，向服务器发起这个资源请求
			return fetch(event.request).then(response => {
				if(!response || response.status !== 200) {
					return response;
				}
				// 请求成功的话，将请求缓存起来
				cache.open('test-v1').then(cache => {
					cache.put(event.request, response);
				})
				return response.clone;
			})
		})
	)
})